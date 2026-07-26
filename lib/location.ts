// 门店定位（2026-07 客户反馈：地图仍指向旧 Plaça Europa 店，统一改到 Santa Eulàlia）
export const ADDRESS_QUERY =
  "Sushi Maydo, Carrer Santa Eulàlia, 204, 08902 L'Hospitalet de Llobregat, Barcelona";

const encoded = encodeURIComponent(ADDRESS_QUERY);

/** 无需 API key 的地图 iframe 源 */
export const GOOGLE_MAPS_EMBED = `https://www.google.com/maps?q=${encoded}&output=embed&z=17`;

/** 「如何到达」按钮 —— 在 Google Maps 中打开同一地址 */
export const GOOGLE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
