//动态时间的选项
export default [{
  id: 1,
    value: 1,
    label: '最近1小时',
    units: 'HOURS',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 2,
    value: '',
    label: '小时',
    units: 'HOURS',
    type: 'dynamic',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 3,
    value: 1,
    label: '最近1天',
    units: 'DAYS',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 4,
    value: 3,
    label: '最近3天',
    units: 'DAYS',
    only_one: false,
    op:'BETWEEN',
  }, {
    id: 5,
    value: 7,
    label: '最近7天',
    units: 'DAYS',
    only_one: false,
    op:'BETWEEN',
  }, {
    id: 6,
    value: 14,
    label: '最近14天',
    units: 'DAYS',
    only_one: false,
    op:'BETWEEN',
  }, {
    id: 7,
    value: 30,
    label: '最近30天',
    units: 'DAYS',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 8,
    value: '',
    label: '天',
    units: 'DAYS',
    type: 'dynamic',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 9,
    value: 1,
    label: '当周',
    units: 'WEEK',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 10,
    value: 2,
    label: '上一周',
    units: 'WEEK',
    only_one: true,
    op:'BETWEEN',
  },
  {
    id: 11,
    value: '',
    label: '周',
    units: 'WEEK',
    type: 'dynamic',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 12,
    value: 1,
    label: '当月',
    units: 'MONTH',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 13,
    value: 2,
    label: '上一月',
    units: 'MONTH',
    only_one: true,
    op:'BETWEEN',
  },
  {
    id: 14,
    value: '',
    label: '月',
    units: 'MONTH',
    type: 'dynamic',
    only_one: false,
    op:'BETWEEN',
  },
  {
    id: 15,
    value: 1,
    label: '今日',
    units: 'DAYS',
    only_one: true,
    op:'=',
  },
  {
    id: 16,
    value: 2,
    label: '昨日',
    units: 'DAYS',
    only_one: true,
    op:'=',
  },
  {
    id: 17,
    value: 3,
    label: '前日',
    units: 'DAYS',
    only_one: true,
    op:'=',
  },
]
