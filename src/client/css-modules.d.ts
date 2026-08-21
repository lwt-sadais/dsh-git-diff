declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.css?inline' {
  const styles: string
  export default styles
}
