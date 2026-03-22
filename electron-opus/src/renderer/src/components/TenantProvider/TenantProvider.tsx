import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetPublicBrandingQuery } from "../../api/tenantApi";
import { setBranding } from "../../store/slices/tenantSlice";
import type { AppDispatch } from "../../store";

/**
 * Loads tenant branding on app startup.
 * Applies primaryColor, secondaryColor, accentColor as CSS variables
 * so Tailwind arbitrary values like text-[var(--color-primary)] work everywhere.
 */
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { data: branding } = useGetPublicBrandingQuery();

  useEffect(() => {
    if (!branding) return;

    dispatch(setBranding(branding));

    const root = document.documentElement;
    root.style.setProperty("--color-primary", branding.primaryColor ?? "#4f46e5");
    root.style.setProperty("--color-secondary", branding.secondaryColor ?? "#0ea5e9");
    root.style.setProperty("--color-accent", branding.accentColor ?? "#10b981");

    if (branding.fontFamily) {
      root.style.setProperty("--font-family", branding.fontFamily);
    }

    if (branding.companyName) {
      document.title = branding.companyName;
    }

    if (branding.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
  }, [branding, dispatch]);

  return <>{children}</>;
}
