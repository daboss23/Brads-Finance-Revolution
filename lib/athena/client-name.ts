// One definition of the first name Athena speaks.
//
// The live ConvAI agent opens with "Hi {{client_first_name}}!" and the text
// fallback opens with the same line, so both paths have to derive the same
// name from the same stored value or the two Athenas greet the client
// differently.
//
// Joint files are stored as "Rob & Kate Mitchell". Splitting on the first
// space there would greet a couple as "Rob", so the ampersand form drops the
// shared surname instead and keeps both given names.
export function firstNameOf(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return "there";
  if (trimmed.includes("&")) {
    const withoutSurname = trimmed.split(/\s+/).slice(0, -1).join(" ");
    return withoutSurname || trimmed;
  }
  return trimmed.split(/\s+/)[0];
}
