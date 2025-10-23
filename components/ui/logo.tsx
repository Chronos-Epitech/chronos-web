import Image from 'next/image';
import defaultImage from '@/assets/logo.png';
import { logoPath } from '@/lib/config';

export default function Logo() {
  return (
    <div>
      <Image
        src={logoPath}
        alt="Description de l'image"
        width={81} // largeur en pixels
        height={81} // hauteur en pixels
      />
    </div>
  );
}
