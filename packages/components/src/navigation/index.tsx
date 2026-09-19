import { matchPath, useLocation } from 'react-router-dom'

export const isNavItemActive = (pathname: string, path: string, exact = false) =>
  exact ? matchPath(path, pathname) !== null : pathname.startsWith(path)

export const useHasBackHeader = (paths: string[]) => {
  const { pathname } = useLocation()
  return paths.some((path) => matchPath(path, pathname) !== null)
}
