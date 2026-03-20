const dict = {
  es: {
    // Sidebar
    dashboard: "Dashboard",
    reservations: "Reservas",
    orders: "Pedidos",
    messages: "Mensajes",
    giftCards: "Gift Cards",
    coupons: "Cupones",
    viewSite: "Ver sitio web",
    logout: "Cerrar sesión",
    adminPanel: "Panel de administración",

    // Login
    password: "Contraseña",
    wrongPassword: "Contraseña incorrecta",
    login: "Acceder",
    loggingIn: "Accediendo...",

    // Dashboard
    dashboardTitle: "Dashboard",
    dashboardDesc: "Resumen general de Sushi Maydo",
    pendingReservations: "Reservas pendientes",
    pendingOrders: "Pedidos pendientes",
    unreadMessages: "Mensajes sin leer",
    total: "en total",
    recentReservations: "Últimas reservas",
    recentOrders: "Últimos pedidos",
    viewAll: "Ver todos",
    noReservations: "Sin reservas",
    noOrders: "Sin pedidos",
    pax: "pax",

    // Reservations
    reservationsTitle: "Reservas",
    reservationsCount: "{count} reservas en total",
    client: "Cliente",
    date: "Fecha",
    time: "Hora",
    guests: "Pax",
    shift: "Turno",
    status: "Estado",
    created: "Creada",
    customerNotes: "Notas de clientes",
    noReservationsYet: "No hay reservas",

    // Orders
    ordersTitle: "Pedidos",
    ordersCount: "{count} pedidos en total",
    items: "Artículos",
    orderDate: "Fecha",
    pickup: "Recogida",
    address: "Dirección",
    shipping: "Envío",
    notes: "Notas",
    noOrdersYet: "No hay pedidos",

    // Contacts
    messagesTitle: "Mensajes",
    messagesCount: "{count} mensajes · {unread} sin leer",
    markRead: "Marcar leído",
    noMessagesYet: "No hay mensajes",

    // Gift Cards
    giftCardsTitle: "Gift Cards",
    giftCardsCount: "{count} tarjetas regalo",
    code: "Código",
    amount: "Importe",
    balance: "Saldo",
    fromTo: "De → Para",
    message: "Mensaje",
    noGiftCardsYet: "No hay tarjetas regalo",

    // Coupons
    couponsTitle: "Cupones",
    couponsCount: "{count} cupones",
    newCoupon: "Nuevo cupón",
    createCoupon: "Crear cupón",
    discount: "Descuento",
    minOrder: "Mín. pedido",
    uses: "Usos",
    active: "Activo",
    type: "Tipo",
    value: "Valor",
    maxUses: "Máx. usos",
    percentage: "Porcentaje (%)",
    fixed: "Fijo (€)",
    cancel: "Cancelar",
    creating: "Creando...",
    create: "Crear cupón",
    noCouponsYet: "No hay cupones",
  },
  zh: {
    // Sidebar
    dashboard: "仪表盘",
    reservations: "预约管理",
    orders: "订单管理",
    messages: "消息管理",
    giftCards: "礼品卡",
    coupons: "优惠券",
    viewSite: "查看网站",
    logout: "退出登录",
    adminPanel: "管理后台",

    // Login
    password: "密码",
    wrongPassword: "密码错误",
    login: "登录",
    loggingIn: "登录中...",

    // Dashboard
    dashboardTitle: "仪表盘",
    dashboardDesc: "Sushi Maydo 总览",
    pendingReservations: "待处理预约",
    pendingOrders: "待处理订单",
    unreadMessages: "未读消息",
    total: "总计",
    recentReservations: "最近预约",
    recentOrders: "最近订单",
    viewAll: "查看全部",
    noReservations: "暂无预约",
    noOrders: "暂无订单",
    pax: "人",

    // Reservations
    reservationsTitle: "预约管理",
    reservationsCount: "共 {count} 条预约",
    client: "客户",
    date: "日期",
    time: "时间",
    guests: "人数",
    shift: "时段",
    status: "状态",
    created: "创建时间",
    customerNotes: "客户备注",
    noReservationsYet: "暂无预约",

    // Orders
    ordersTitle: "订单管理",
    ordersCount: "共 {count} 个订单",
    items: "菜品",
    orderDate: "日期",
    pickup: "取餐时间",
    address: "地址",
    shipping: "配送费",
    notes: "备注",
    noOrdersYet: "暂无订单",

    // Contacts
    messagesTitle: "消息管理",
    messagesCount: "共 {count} 条消息 · {unread} 条未读",
    markRead: "标为已读",
    noMessagesYet: "暂无消息",

    // Gift Cards
    giftCardsTitle: "礼品卡",
    giftCardsCount: "共 {count} 张礼品卡",
    code: "卡号",
    amount: "面额",
    balance: "余额",
    fromTo: "赠送人 → 收礼人",
    message: "留言",
    noGiftCardsYet: "暂无礼品卡",

    // Coupons
    couponsTitle: "优惠券",
    couponsCount: "共 {count} 张优惠券",
    newCoupon: "新建优惠券",
    createCoupon: "创建优惠券",
    discount: "折扣",
    minOrder: "最低消费",
    uses: "使用次数",
    active: "启用",
    type: "类型",
    value: "数值",
    maxUses: "最大使用次数",
    percentage: "百分比 (%)",
    fixed: "固定金额 (€)",
    cancel: "取消",
    creating: "创建中...",
    create: "创建",
    noCouponsYet: "暂无优惠券",
  },
} as const;

export type AdminLocale = keyof typeof dict;
export type AdminKey = keyof (typeof dict)["es"];

export function getAdminT(locale: AdminLocale) {
  const d = dict[locale];
  return function t(key: AdminKey, params?: Record<string, string | number>): string {
    let str: string = d[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}

export const ADMIN_LOCALES: AdminLocale[] = ["es", "zh"];
