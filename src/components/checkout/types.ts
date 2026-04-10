export type CheckoutMode = "guest" | "authenticated";

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  region?: string;
  country: string;
}

export interface CheckoutState {
  mode: CheckoutMode | null;
  address: CheckoutAddress | null;
  savedAddressId: string | null;
  paymentMethod: "stripe" | "saved_card" | null;
  savedPaymentMethodId: string | null;
}

export const EMPTY_ADDRESS: CheckoutAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  street2: "",
  city: "",
  postalCode: "",
  region: "",
  country: "FR",
};
