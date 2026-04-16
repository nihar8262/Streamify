export const getImageUrl = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const formatRating = (rating) => Number.isFinite(rating) ? rating.toFixed(1) : 'N/A';

export const formatYear = (dateString) => {
  if (!dateString) {
    return 'TBA';
  }

  const year = new Date(dateString).getFullYear();
  return Number.isNaN(year) ? 'TBA' : String(year);
};

export const formatFullDate = (dateString) => {
  if (!dateString) {
    return 'Coming soon';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Coming soon';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRuntime = (runtime) => {
  if (!Number.isFinite(runtime) || runtime <= 0) {
    return 'Unknown runtime';
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

export const formatRevenue = (revenue) => {
  if (!Number.isFinite(revenue) || revenue <= 0) {
    return 'Unknown';
  }

  if (revenue >= 1000000000) {
    return `$${(revenue / 1000000000).toFixed(1)}B`;
  }

  if (revenue >= 1000000) {
    return `$${(revenue / 1000000).toFixed(1)}M`;
  }

  return `$${revenue.toLocaleString()}`;
};

export const trimOverview = (overview, length = 140) => {
  if (!overview) {
    return 'No overview available.';
  }

  return overview.length > length ? `${overview.slice(0, length)}...` : overview;
};