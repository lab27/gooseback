export const useStaticRemover = () => {
  const staticRemover = (path: string) => {
    if (!path) return path
    
    // Remove /static prefix (original functionality)
    if (path.includes('/static')) {
      return path.replace('/static', '')
    }
    
    // Remove /public prefix (for content files that reference /public)
    if (path.includes('/public')) {
      return path.replace('/public', '')
    }
    
    return path
  }

  return {
    staticRemover
  }
}
