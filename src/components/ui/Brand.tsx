import bosscoLogo from '../../assets/images/Bossco_Logo__2__page-0001-removebg-preview.png'

export function Brand() {
  return (
    <a
      className="group grid size-14 place-items-center sm:size-16"
      href="#home"
      aria-label="Bossco home"
    >
      <img
        className="size-[78px] max-w-none object-contain transition-transform duration-300 group-hover:scale-105 sm:size-[92px]"
        src={bosscoLogo}
        alt="Bossco — House of Dry Fruits and Nuts"
      />
    </a>
  )
}
