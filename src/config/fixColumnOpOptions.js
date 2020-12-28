//固定列不同类型支持的操作符
export default {
  "string": [{
      name: "等于",
      value: "=",
    },
    {
      name: "不等于",
      value: "<>",
    }
  ],
  "number": [{
      name: "等于",
      value: "=",
    },
    {
      name: "不等于",
      value: "<>",
    },
    {
      name: "大于",
      value: ">",
    },
    {
      name: "大于等于",
      value: ">=",
    },
    {
      name: "小于",
      value: "<",
    },
    {
      name: "小于等于",
      value: "<=",
    },
    {
      name: "区间",
      value: "BETWEEN",
    }
  ],
  "date": [{
      name: "等于",
      value: "=",
    },
    {
      name: "不等于",
      value: "<>",
    },
    {
      name: "大于",
      value: ">",
    },
    {
      name: "大于等于",
      value: ">=",
    },
    {
      name: "小于",
      value: "<",
    },
    {
      name: "小于等于",
      value: "<=",
    },
    {
      name: "区间",
      value: "BETWEEN",
    }
  ],
  "time": [{
      name: "等于",
      value: "=",
    },
    {
      name: "区间",
      value: "BETWEEN",
    }
  ],
  "dimension": [{
      name: "等于",
      value: "=",
      only_str: false,
    },
    {
      name: "IN",
      value: "IN",
    }
  ],
}
