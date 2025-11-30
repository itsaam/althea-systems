import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "mobile" | "desktop";
}

export default function Logo({ variant = "desktop" }: LogoProps) {
  return (
    <Link href="/" className="flex items-center">
      {variant === "mobile" ? (
        <Image
          src="/images/logos/logo-mobile.svg"
          alt="Althea"
          width={40}
          height={40}
        />
      ) : (
        <Image
          src="/images/logos/logo-desktop.svg"
          alt="Althea"
          width={180}
          height={40}
          className="hidden md:block"
        />
      )}
      <Image
        src="/images/logos/logo-mobile.svg"
        alt="Althea"
        width={40}
        height={40}
        className="md:hidden"
      />
    </Link>
  );
}
