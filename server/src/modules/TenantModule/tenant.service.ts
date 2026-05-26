import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { tenantSettings, tenantPages } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TenantService {
  constructor(private readonly databaseService: DatabaseService) {}

  /** Strip read-only / server-managed fields (JSON sends dates as strings). */
  private pickTenantSettingsUpdate(
    data: Partial<typeof tenantSettings.$inferInsert>,
  ): Partial<typeof tenantSettings.$inferInsert> {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      setupCompletedAt: _setupCompletedAt,
      ...rest
    } = data;
    return rest;
  }

  /**
   * Returns the single tenant settings row.
   * Creates a default one on first access (embedded mode).
   */
  async getSettings() {
    const [settings] = await this.databaseService.db
      .select()
      .from(tenantSettings)
      .limit(1);

    if (!settings) {
      // Auto-initialize for embedded installations
      const [created] = await this.databaseService.db
        .insert(tenantSettings)
        .values({})
        .returning();
      return created;
    }

    return settings;
  }

  async updateSettings(data: Partial<typeof tenantSettings.$inferInsert>) {
    const current = await this.getSettings();
    const payload = this.pickTenantSettingsUpdate(data);

    const [updated] = await this.databaseService.db
      .update(tenantSettings)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(tenantSettings.id, current.id))
      .returning();

    return updated;
  }

  async completeSetup() {
    const current = await this.getSettings();

    const [updated] = await this.databaseService.db
      .update(tenantSettings)
      .set({
        isSetupComplete: true,
        setupCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.id, current.id))
      .returning();

    return updated;
  }

  // Public branding — no auth required, used by frontend theme
  async getPublicBranding() {
    const settings = await this.getSettings();
    return {
      companyName: settings.companyName,
      tagline: settings.tagline,
      description: settings.description,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      fontFamily: settings.fontFamily,
      workingHours: settings.workingHours,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      website: settings.website,
      mapCoordinates: settings.mapCoordinates,
      currency: settings.currency,
      language: settings.language,
      features: {
        onlineBooking: settings.featureOnlineBooking,
        vinDecoder: settings.featureVinDecoder,
        loyaltyProgram: settings.featureLoyaltyProgram,
        partnerNetwork: settings.featurePartnerNetwork,
        multiBranch: settings.featureMultiBranch,
        corporateClients: settings.featureCorporateClients,
        emailNotifications: settings.featureEmailNotifications,
      },
    };
  }

  // Pages (custom content)
  async getPages() {
    return this.databaseService.db
      .select()
      .from(tenantPages)
      .orderBy(tenantPages.slug);
  }

  async getPageBySlug(slug: string) {
    const [page] = await this.databaseService.db
      .select()
      .from(tenantPages)
      .where(eq(tenantPages.slug, slug))
      .limit(1);

    if (!page) throw new NotFoundException(`Page "${slug}" not found`);
    return page;
  }

  async upsertPage(data: {
    slug: string;
    title: string;
    content: string;
    isPublished?: boolean;
  }) {
    const existing = await this.databaseService.db
      .select()
      .from(tenantPages)
      .where(eq(tenantPages.slug, data.slug))
      .limit(1);

    if (existing.length) {
      const [updated] = await this.databaseService.db
        .update(tenantPages)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tenantPages.slug, data.slug))
        .returning();
      return updated;
    }

    const [created] = await this.databaseService.db
      .insert(tenantPages)
      .values(data)
      .returning();
    return created;
  }
}
