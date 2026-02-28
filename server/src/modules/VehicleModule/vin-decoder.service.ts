import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface VinDecodeResult {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  bodyStyle?: string;
  driveType?: string;
  engineSize?: string;
  fuelType?: string;
  transmissionStyle?: string;
  plantCountry?: string;
  vehicleType?: string;
  errors?: string[];
}

/**
 * NHTSA vPIC API integration for VIN decoding.
 * Free, no API key required.
 * Docs: https://vpic.nhtsa.dot.gov/api/
 */
@Injectable()
export class VinDecoderService {
  private readonly logger = new Logger(VinDecoderService.name);
  private readonly baseUrl = 'https://vpic.nhtsa.dot.gov/api/vehicles';

  async decodeVin(vin: string): Promise<VinDecodeResult> {
    const cleaned = vin.trim().toUpperCase();

    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
      throw new BadRequestException(
        'Invalid VIN: must be 17 alphanumeric characters (excluding I, O, Q)',
      );
    }

    try {
      const url = `${this.baseUrl}/DecodeVinValues/${cleaned}?format=json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`NHTSA API returned ${response.status}`);
      }

      const data = (await response.json());
      const result = data?.Results?.[0];

      if (!result) {
        throw new Error('Empty response from NHTSA API');
      }

      const errors: string[] = [];
      if (result.ErrorCode && result.ErrorCode !== '0') {
        errors.push(result.ErrorText || `Error code ${result.ErrorCode}`);
      }

      const decoded: VinDecodeResult = {
        vin: cleaned,
        make: result.Make || undefined,
        model: result.Model || undefined,
        year: result.ModelYear ? parseInt(result.ModelYear, 10) : undefined,
        bodyStyle: result.BodyClass || undefined,
        driveType: result.DriveType || undefined,
        engineSize: result.EngineConfiguration || undefined,
        fuelType: result.FuelTypePrimary || undefined,
        transmissionStyle: result.TransmissionStyle || undefined,
        plantCountry: result.PlantCountry || undefined,
        vehicleType: result.VehicleType || undefined,
        errors: errors.length ? errors : undefined,
      };

      this.logger.log(
        `VIN decoded: ${cleaned} → ${decoded.year} ${decoded.make} ${decoded.model}`,
      );

      return decoded;
    } catch (err) {
      this.logger.error(`VIN decode failed for ${cleaned}: ${err}`);
      throw new BadRequestException(`VIN decode failed: ${String(err)}`);
    }
  }

  async decodeVinBatch(vins: string[]): Promise<VinDecodeResult[]> {
    return Promise.all(vins.map(vin => this.decodeVin(vin)));
  }
}
