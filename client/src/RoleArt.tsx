import { ROLE_ART } from "./roleArt";

export function RoleArt({ name }: { name: string }) {
  const svg = ROLE_ART[name] ?? ROLE_ART.Villager;
  return <div className="artsvg" dangerouslySetInnerHTML={{ __html: svg }} />;
}
