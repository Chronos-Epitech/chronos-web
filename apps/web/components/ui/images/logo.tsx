import Image from "next/image";

export default function Logo() {
  return (
    <div>
      <Image src="/logo.png" alt="Chronos Logo" width={81} height={81} />
    </div>
  );
}
