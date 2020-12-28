//静态时间的快速选择选项
export default {
  shortcuts: [{
      text: "最近1小时",
      onClick: (picker) => {
        const end = new Date();
        const start = new Date();
        start.setMinutes(0);
        start.setSeconds(1);
        end.setMinutes(59);
        end.setSeconds(59);
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "最近7天",
      onClick: (picker) => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 86400 * 7 * 1000);
        // this.self_value.range = [start, end] ;
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(1)
        end.setHours(23)
        end.setMinutes(59)
        end.setSeconds(59)
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "最近30天",
      onClick: (picker) => {
        const end = new Date();
        const start = new Date();
        start.setTime(start.getTime() - 86400 * 30 * 1000);
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(1)
        end.setHours(23)
        end.setMinutes(59)
        end.setSeconds(59)
        // this.self_value.range = [start, end] ;
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "当周",
      onClick: (picker) => {
        var start = new Date();
        start.setDate(start.getDate() - start.getDay() + 1);
        var end = new Date(start.valueOf() + 86400 * 6 * 1000);
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(1)
        end.setHours(23)
        end.setMinutes(59)
        end.setSeconds(59)
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "上一周",
      onClick: (picker) => {
        const start = new Date();
        start.setDate(start.getDate() - start.getDay() + 1 - 7);
        var end = new Date(start.valueOf() + 86400 * 6 * 1000);
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(1)
        end.setHours(23)
        end.setMinutes(59)
        end.setSeconds(59)
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "当月",
      onClick: (picker) => {
        let date = new Date(),
          y = date.getFullYear(),
          m = date.getMonth();
        let start = new Date(y, m, 1);
        let end = new Date(y, m + 1, 0);
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(1)
        end.setHours(23)
        end.setMinutes(59)
        end.setSeconds(59)
        // this.self_value.range = [start, end] ;
        picker.$emit("pick", [start, end]);
      },
    },
    {
      text: "上一月",
      onClick: (picker) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - start.getDate() + 1);
        start.setMonth(start.getMonth() - 1);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        start.setHours(0)
        start.setMinutes(0)
        start.setSeconds(1)
        end.setHours(23)
        end.setMinutes(59)
        end.setSeconds(59)
        picker.$emit("pick", [start, end]);
      },
    }
  ],
}
