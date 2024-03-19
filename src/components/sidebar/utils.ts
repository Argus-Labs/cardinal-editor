export const formatName = (name: string) => {
  let s = name.replace(/-/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
