/**
 * 城市数据配置
 * 包含热门城市和按首字母分组的全国城市
 */

export interface CityItem {
  label: string;
  value: string;
}

export interface CityGroup {
  title: string;
  items: CityItem[];
}

// 热门城市
export const hotCities: CityItem[] = [
  { label: "全国", value: "全国" },
  { label: "北京", value: "北京" },
  { label: "上海", value: "上海" },
  { label: "广州", value: "广州" },
  { label: "深圳", value: "深圳" },
  { label: "杭州", value: "杭州" },
  { label: "成都", value: "成都" },
  { label: "武汉", value: "武汉" },
  { label: "南京", value: "南京" },
  { label: "西安", value: "西安" },
  { label: "重庆", value: "重庆" },
  { label: "苏州", value: "苏州" },
];

// 按首字母分组的全国城市
export const cityGroups: CityGroup[] = [
  {
    title: "A",
    items: [
      { label: "安庆", value: "安庆" },
      { label: "鞍山", value: "鞍山" },
      { label: "安阳", value: "安阳" },
    ],
  },
  {
    title: "B",
    items: [
      { label: "北京", value: "北京" },
      { label: "保定", value: "保定" },
      { label: "包头", value: "包头" },
      { label: "蚌埠", value: "蚌埠" },
      { label: "滨州", value: "滨州" },
    ],
  },
  {
    title: "C",
    items: [
      { label: "成都", value: "成都" },
      { label: "重庆", value: "重庆" },
      { label: "长沙", value: "长沙" },
      { label: "长春", value: "长春" },
      { label: "常州", value: "常州" },
      { label: "常德", value: "常德" },
      { label: "沧州", value: "沧州" },
    ],
  },
  {
    title: "D",
    items: [
      { label: "大连", value: "大连" },
      { label: "东莞", value: "东莞" },
      { label: "大庆", value: "大庆" },
      { label: "德州", value: "德州" },
    ],
  },
  {
    title: "F",
    items: [
      { label: "福州", value: "福州" },
      { label: "佛山", value: "佛山" },
      { label: "阜阳", value: "阜阳" },
    ],
  },
  {
    title: "G",
    items: [
      { label: "广州", value: "广州" },
      { label: "贵阳", value: "贵阳" },
      { label: "桂林", value: "桂林" },
      { label: "赣州", value: "赣州" },
    ],
  },
  {
    title: "H",
    items: [
      { label: "杭州", value: "杭州" },
      { label: "合肥", value: "合肥" },
      { label: "哈尔滨", value: "哈尔滨" },
      { label: "海口", value: "海口" },
      { label: "惠州", value: "惠州" },
      { label: "湖州", value: "湖州" },
      { label: "淮安", value: "淮安" },
      { label: "呼和浩特", value: "呼和浩特" },
      { label: "邯郸", value: "邯郸" },
    ],
  },
  {
    title: "J",
    items: [
      { label: "济南", value: "济南" },
      { label: "嘉兴", value: "嘉兴" },
      { label: "金华", value: "金华" },
      { label: "济宁", value: "济宁" },
      { label: "江门", value: "江门" },
      { label: "九江", value: "九江" },
      { label: "吉林", value: "吉林" },
      { label: "揭阳", value: "揭阳" },
    ],
  },
  {
    title: "K",
    items: [
      { label: "昆明", value: "昆明" },
      { label: "开封", value: "开封" },
    ],
  },
  {
    title: "L",
    items: [
      { label: "兰州", value: "兰州" },
      { label: "洛阳", value: "洛阳" },
      { label: "柳州", value: "柳州" },
      { label: "临沂", value: "临沂" },
      { label: "连云港", value: "连云港" },
      { label: "廊坊", value: "廊坊" },
    ],
  },
  {
    title: "M",
    items: [
      { label: "绵阳", value: "绵阳" },
      { label: "茂名", value: "茂名" },
    ],
  },
  {
    title: "N",
    items: [
      { label: "南京", value: "南京" },
      { label: "宁波", value: "宁波" },
      { label: "南昌", value: "南昌" },
      { label: "南宁", value: "南宁" },
      { label: "南通", value: "南通" },
      { label: "南阳", value: "南阳" },
    ],
  },
  {
    title: "Q",
    items: [
      { label: "青岛", value: "青岛" },
      { label: "泉州", value: "泉州" },
      { label: "秦皇岛", value: "秦皇岛" },
      { label: "清远", value: "清远" },
    ],
  },
  {
    title: "S",
    items: [
      { label: "上海", value: "上海" },
      { label: "深圳", value: "深圳" },
      { label: "苏州", value: "苏州" },
      { label: "沈阳", value: "沈阳" },
      { label: "石家庄", value: "石家庄" },
      { label: "绍兴", value: "绍兴" },
      { label: "汕头", value: "汕头" },
      { label: "三亚", value: "三亚" },
      { label: "韶关", value: "韶关" },
    ],
  },
  {
    title: "T",
    items: [
      { label: "天津", value: "天津" },
      { label: "太原", value: "太原" },
      { label: "台州", value: "台州" },
      { label: "唐山", value: "唐山" },
      { label: "泰州", value: "泰州" },
      { label: "泰安", value: "泰安" },
    ],
  },
  {
    title: "W",
    items: [
      { label: "武汉", value: "武汉" },
      { label: "无锡", value: "无锡" },
      { label: "温州", value: "温州" },
      { label: "潍坊", value: "潍坊" },
      { label: "芜湖", value: "芜湖" },
      { label: "威海", value: "威海" },
      { label: "乌鲁木齐", value: "乌鲁木齐" },
    ],
  },
  {
    title: "X",
    items: [
      { label: "西安", value: "西安" },
      { label: "厦门", value: "厦门" },
      { label: "徐州", value: "徐州" },
      { label: "襄阳", value: "襄阳" },
      { label: "西宁", value: "西宁" },
      { label: "湘潭", value: "湘潭" },
      { label: "咸阳", value: "咸阳" },
      { label: "新乡", value: "新乡" },
    ],
  },
  {
    title: "Y",
    items: [
      { label: "扬州", value: "扬州" },
      { label: "烟台", value: "烟台" },
      { label: "宜昌", value: "宜昌" },
      { label: "银川", value: "银川" },
      { label: "盐城", value: "盐城" },
      { label: "岳阳", value: "岳阳" },
      { label: "宜春", value: "宜春" },
    ],
  },
  {
    title: "Z",
    items: [
      { label: "郑州", value: "郑州" },
      { label: "珠海", value: "珠海" },
      { label: "中山", value: "中山" },
      { label: "镇江", value: "镇江" },
      { label: "淄博", value: "淄博" },
      { label: "株洲", value: "株洲" },
      { label: "漳州", value: "漳州" },
      { label: "遵义", value: "遵义" },
      { label: "湛江", value: "湛江" },
    ],
  },
];

// 获取所有城市列表（扁平化）
export const getAllCities = (): CityItem[] => {
  const all: CityItem[] = [{ label: "全国", value: "全国" }];
  cityGroups.forEach((group) => {
    all.push(...group.items);
  });
  return all;
};

// 搜索城市
export const searchCities = (keyword: string): CityItem[] => {
  if (!keyword.trim()) return [];
  const lowerKeyword = keyword.toLowerCase();
  const all = getAllCities();
  return all.filter(
    (city) =>
      city.label.toLowerCase().includes(lowerKeyword) ||
      city.value.toLowerCase().includes(lowerKeyword)
  );
};
