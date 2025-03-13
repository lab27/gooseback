export const useStaticRemover = () => {
  const staticRemover = (path: string) => {
    if (path?.includes('/static')) {
      return path.replace('/static', '')
    }
    return path
  }

  return {
    staticRemover
  }
}
