export enum AddressType {
  HOME = "HOME",
  WORK = "WORK",
  BILLING = "BILLING",
  OTHER = "OTHER",
}

export interface Address {
  id: string;
  type: AddressType;
  isDefault: boolean;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}
