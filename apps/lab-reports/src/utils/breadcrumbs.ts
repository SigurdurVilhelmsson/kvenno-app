interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Helper function to generate breadcrumbs based on current path
export const getBreadcrumbsForPath = (basePath: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [{ label: 'Heim', href: '/' }];

  // Extract year from base path (e.g., /2-ar/lab-reports/ -> 2. ár)
  const yearMatch = basePath.match(/\/(\d)-ar\//);
  if (yearMatch) {
    const year = yearMatch[1];
    items.push({
      label: `${year}. ár`,
      href: `/efnafraedi/${year}-ar/`,
    });
  }

  // Add current page
  items.push({ label: 'Tilraunarskýrslur' });

  return items;
};
