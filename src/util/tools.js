var tools = {
    formatTime(time){
      if(time =='--'){
        return time ;
      }
      if(!time){
        return '';
      }
      var t = new Date(time) ;
      // t = t.valueOf();
      var t = t.Format('yyyy-MM-dd HH:mm');
      return t ;
    },
    /**
     * @param {Object} data_list
     * 将二维数组中每个空格的字段替换成'--'
     */
    replaceSpace(data_list){
      return ;
      for(var row of data_list){
        for(var k in row){
          if(row[k] == ''){
            row[k] = '--' ;
          }
        }
      }
    },
  /**
   * @param {Object} data
   * @param {Object} field
   * 返回二位数组中的某列的值
   */
  array_column: function(data, field) {
    let new_data = [];
    for (var v of data) {
      new_data.push(v[field]);
    }
    return new_data;
  },
  /**
   * 坐标轴转换  按日期转换
   * @param {Object} original_data
   * @param {Object} original_group_by
   * @param {Object} original_select_field
   */
  convertToDate: function(original_data, original_group_by, original_select_field) {
    //防止更改原始数据
    let data = JSON.parse(JSON.stringify(original_data));
    let select_field = JSON.parse(JSON.stringify(original_select_field));
    var date_field = '';
    var group_by = []; //去除 时间字段的group_by
    var old_group_by = [];
    for (var v of original_group_by) {
      if (v == '日期') {
        date_field = '日期';
      } else {
        group_by.push(v);
        old_group_by.push(v);
      }
    }
    if (date_field == '') {
      throw new Error("当前数据无日期字段，无法按日期转换");
    }
    var group = {};
    var group_data = [];
    for (var g of group_by) {
      group_data.push(Array.from(new Set(this.array_column(data, g))).sort());
    }
    group_data.push(select_field)
    group_by.push('聚合');

    //除去 日期字段       分组字段和聚合字段的值 组合d
    var new_data = [];
    var temp = {};
    this._convert_date(group_data, group_by, 0, new_data, temp); //递归组合 笛卡尔积   各个group by的值 和聚合

    //获取date的不同值
    var date_list = Array.from(new Set(this.array_column(data, date_field))).sort()
    var show_field = group_by.concat(date_list); //转换为日期之后的表头字段

    var data_map = {};
    for (var row of data) {
      var tag_array = [];
      for (var g of old_group_by) {
        tag_array.push(row[g])
      }
      for (var s of select_field) {
        if (!data_map.hasOwnProperty(tag_array.join('_') + '_' + s)) {
          data_map[tag_array.join('_') + '_' + s] = {};
        }
        data_map[tag_array.join('_') + '_' + s][row[date_field]] = row[s];
      }
    }
    var usefull_data = [];
    for (var v of new_data) {
      var t = Object.values(v);
      var key = t.join('_');
      if (data_map.hasOwnProperty(key)) {
        var v = Object.assign(v, data_map[key]);
        usefull_data.push(v)
      }
    }

    //补0处理
    for (row of usefull_data) {
      for (var f of show_field) {
        if (!row.hasOwnProperty(f)) {
          row[f] = 0;
        }
      }
    }
    return usefull_data;
  },
  /**
   *  '''递归按照日期转换数据  坐标轴转换功能'''
   * @param {Object} group_data
   * @param {Object} group_field
   * @param {Object} index
   * @param {Object} new_data
   * @param {Object} temp
   */
  _convert_date: function(group_data, group_field, index, new_data, temp) {
    var now = group_data[index];
    for (var v of now) {
      temp[group_field[index]] = v
      if (index >= (group_data.length - 1)) {
        new_data.push(JSON.parse(JSON.stringify(temp)));
      } else {
        this._convert_date(group_data, group_field, index + 1, new_data, temp)
      }
    }
  },
  /**
   * 坐标轴转换  按分组转换
   * @param {Object} data
   * @param {Object} group_by_field
   * @param {Object} select_field
   */
  convertToGroup: function(original_data, original_group_by, original_select_field) {
    let data = JSON.parse(JSON.stringify(original_data));
    let select_field = JSON.parse(JSON.stringify(original_select_field));

    var date_field = '';
    var group_by = []; //去除 时间字段的group_by
    var old_group_by = [];
    for (var v of original_group_by) {
      if (v == '日期') {
        date_field = '日期';
      } else {
        group_by.push(v);
        old_group_by.push(v);
      }
    }
    if (date_field == '') {
      throw new Error("当前数据无日期字段，无法转换");
    }

    var distinct_field = [];
    var select_data = {};
    var date = Array.from(new Set(this.array_column(data, date_field))).sort();
    for (v of data) {
      var temp = [];
      for (var g of group_by) {
        temp.push(v[g]);
      }
      var group_key = temp.join(',');
      if (distinct_field.indexOf(group_key) == -1) {
        distinct_field.push(group_key)
      }
      distinct_field.sort();
      for (var s of select_field) {
        if (!select_data.hasOwnProperty(s)) {
          select_data[s] = {}
        }
        if (!select_data[s].hasOwnProperty(v[date_field])) {
          select_data[s][v[date_field]] = {}
        }
        select_data[s][v[date_field]][group_key] = v[s]
      }
    }
    var show_field = [date_field, "聚合"].concat(distinct_field);
    var new_data = [];
    for (var s in select_data) {
      var s_data = select_data[s];
      for (var v of date) {
        var temp = {};
        temp["聚合"] = s;
        temp[date_field] = v;
        for (var f of distinct_field) {
          if (s_data.hasOwnProperty(v)) {
            if (s_data[v].hasOwnProperty(f)) {
              temp[' ' + f] = s_data[v][f];
            } else {
              temp[' ' + f] = 0;
            }
          } else {
            temp[' ' + f] = 0;
          }
        }

        new_data.push(temp)
      }
    }
    return new_data;

    /*
      data = json.loads(json_encode(data))
            distinct_field = []
            select_data =  {}
            date =  list(set(array_column(data,'日期')))
            date.sort()
            for v in data:
                temp = []
                for g in group_field:
                    temp.append(str(v[g]))
                group_key  =  ','.join(temp)
                if group_key not in distinct_field:
                    distinct_field.append(group_key)
                for s in select_field:
                    if s not  in select_data:
                        select_data[s] = {}
                    if  v["日期"]  not in  select_data[s]:
                        select_data[s][v["日期"]] = {}
                    select_data[s][v["日期"]][group_key] = v[s]
            show_field = ["日期","聚合"]  +  distinct_field
            new_data = []
            for s in select_data:
                s_data = select_data[s]
                for v  in date:
                    temp = {}
                    temp["聚合"] = s
                    temp["日期"] = v
                    for f in distinct_field:
                        if v in  s_data:
                            if f in  s_data[v]:
                                temp[f] =   s_data[v][f]
                            else:
                                temp[f] = 0
                        else:
                            temp[f] = 0
                    new_data.append(temp)

            temp_bar_data = {}
            for v in distinct_field:
                temp_bar_data[v] = {}
            header = []
            for v in new_data:
                tag_array = []
                for g in  ["日期","聚合"]:
                    tag_array.append(str(v[g]))
                key = ','.join(tag_array)
                header.append(key)
                for f in distinct_field:
                    if f in v:
                        temp_bar_data[f][key] = v[f]



            bar_header = ['日期'] + header

            bar_data = []
            bar_data.append(bar_header)
            for group_combine in temp_bar_data:
                row = [group_combine]
                for k in temp_bar_data[group_combine]:
                    row.append(temp_bar_data[group_combine][k])
                bar_data.append(row)

            bar_width = (bar_data.__len__() - 1) * (bar_data[0].__len__() - 1) * (10 + (bar_data[0].__len__() - 1) * 3)
            if bar_width < 1200:
                bar_width = 1200
            d = {}
            d["show_field"] = show_field
            d["data"]  = new_data
            d["bar_data"] = json_encode(bar_data)
            d["bar_width"] = bar_width
            return d
            */
  },
  list2map: function(data, key) { //把list的数组转换为 以key字段做key的map
    var map = {}
    data.map((v) => {
      map[v[key]] = v
    })
    return map;
  },
  list2f1f2: function(data, key1, key2) { // list数组转为 {"k1":"k2"}的对象
    var map = {}
    data.map((v) => {
      map[v[key1]] = v[key2]
    })
    return map;
  },
  regroup_op: function(operation_list) { //把操作符列表转换成按照字段类型做key的复杂map
    var field_map = {}
    operation_list.map((operation) => {
      operation.field_types.map((field) => {
        if (field_map.hasOwnProperty(field)) {
          field_map[field].push(operation)
        } else {
          field_map[field] = [operation]
        }
      })
      delete(operation["field_types"]);
    })
    return field_map
  },
  add_label: function(data) { //接口统一返回的 name value  elementUI需要的是 label和value
    data.map((v) => {
      v.lable = v.name
    })
  },
  makeSubmitParam: {
    check_number: function(value, field_name) {
      value = parseFloat(value);
      if (typeof value === 'number' && !isNaN(value)) {
        return true;
      } else {
        throw new Error(field_name + "的值需要是数值型");
      }
    },
    //分析对象组件
    analyzeObject: function(value) {
      var value = JSON.parse(JSON.stringify(value));
      if (!value.object) {
        return this.error("请选择分析对象");
      }
      if (value.type != 'platform' && value.type != 'group') {
        return this.error("请选择是否分析用户包");
      }
      if (value.type == 'platform') {
        value.user_group = '';
        if (value.platform.length == 0) {
          return this.error("请至少选择一个平台");
        }
        if (value.time.type == 'STATIC') {
          if (value.time.start == '') {
            return this.error("时间范围请选择正确的时间");
          }
        } else {
          if (value.time.dynamic_time == '') {
            return this.error("时间范围请选择正确的时间");
          }
        }
        return this.success(value);
      }
      if (value.type == 'group') {
        if (value.user_group == '') {
          return this.error("请选择用户包");
        }
        value.platform = [];
        value.time = {
          range: [], //时间范围 数组
          type: 'STATIC', //STATIC 静态 //DYNAMIC-动态
          dynamic_time: '', //动态时间枚举值
          start: '',
          end: '',
        }
        return this.success(value);
      }
      return this.error("哈哈啊");
    },
    multipleSelect: function(value) {
      if(!value){
        return this.error("请选择平台");
      }
      if (value.length == 0) {
        return this.error("请选择平台");
      }
      return this.success(value);
    },
    single: function(value) {
      return this.success(value);
    },
    /**
     *
     * @param {事件维度} value
     */

    eventDimension: function (values) {
      var type_map = {};
      var values = JSON.parse(JSON.stringify(values));
      let aggs = [];
      for (let i in values) {
        if (values[i].eventGroupValue.length < 1) {
          return this.error("请选择维度事件")
        }
        var attr_id = '';
        if (values[i].eventGroupValue.length == 4) {
          attr_id = values[i].eventGroupValue[3]
        }

        var type = ''
        if (values[i].field_type == 'preset') {
          type = 'PRESET';
        } else {
          type = 'METRIC';
        }
        var agg = {
          type: type,
          event_id: values[i].eventGroupValue[1],
          // id: values[i].eventGroupValue[2],
          // attr_id: attr_id,
        }
        if ('object_behavior' == values[i].eventGroupValue[0]) {
          agg.object_behavior = values[i].eventGroupValue[1];
          agg.event_id = '';
        }


        //拼子条件
        var condition_data = {
          'is_group': true,
          'logic_op': values[i]["logic_op"],
        }
        var new_data = []; //递归拼接子条件
        for (var condition of values[i]["children"]) {
          new_data.push(this.eventSubCondtionRecursion(condition))
        }
        condition_data["conditions"] = new_data;
        agg["conditions"] = condition_data;
        var alias = values[i].name_array.join('/') ;
        if (type_map.hasOwnProperty(alias)) {
          return this.error(alias + "已存在,请删除一个")
        } else {
          type_map[alias] = agg[alias] ;
        }

        aggs.push(agg);
      }
      // var data = {
      //   "event_dims": aggs
      // }
      return this.success(aggs)
    },
    /**
     * @param {Object} value 事件筛选
     */
    eventWhere: function(value) {
      var _value = JSON.parse(JSON.stringify(value));
      var data = {
        "formula": "",
        "agg_by": {}
      }
      if (_value.step_children.length == 0) {
        return this.success(data);
      }
      var orign_step_list = _value.step_children; //渲染数据最顶层步骤列表

      var formula_step_list = [];
      var new_step_list = {}; // 把步骤递归成一个id为key的map
      try {
        for (var step of orign_step_list) {
          var step_key = step.id;
          var temp = this.eventWhereEventRecursion(step, new_step_list); //递归把树状事件变成一维列表
          if (temp) {
            formula_step_list.push(temp);
          }
        }
        var formula = formula_step_list.join(_value.step_logic); //最终公式
      } catch (err) {
        console.log(err);
        return this.error(err.message);
      }
      var alias_map = {};
      var step_list = {};
      for (var step_key in new_step_list) {
        var step = new_step_list[step_key];
        if (step["value"] == '' || step["agg"] == '') {
          continue;
        }
        var field_type = step.field_type;
        var temp = {};
        temp.agg = step.agg;
        if (field_type == 'preset') {
          temp["type"] = 'PRESET';
          temp['alias'] = step["field_name"];
        } else {
          temp["type"] = 'METRIC';
          temp['alias'] = step["field_name"] + '_' + step["agg_name"];
        }
        if (step.alias != '') {
          step["alias"] = step["alias"].trim();
          try {
            this.check_alias(step.alias);
          } catch (err) {
            return this.error(err.message);
          }
          temp['alias'] = step["alias"]
        }
        temp["event_id"] = step["value_array"][1];
        temp["id"] = step["value_array"][2];
        if (step.value_array.length == 4) {
          temp["attr_id"] = step["value_array"][3]
        } else {
          temp["attr_id"] = '';
        }
        if (alias_map.hasOwnProperty(temp["alias"])) {
          // throw new Error(temp["alias"] + "已存在,请重命名或者删除");
        } else {
          alias_map[temp["alias"]] = temp["alias"];
        }
        if (step.hasOwnProperty('is_object_behavior') && step["is_object_behavior"] == 1) {
          temp["object_behavior"] = temp["event_id"];
          temp["event_id"] = "";
          temp["attr_id"] = "";
        }
        //拼子条件
        var condition_data = {
          'is_group': true,
          'logic_op': step["logic_op"],
        }
        try {
          var new_data = []; //递归拼接子条件
          for (var condition of step["children"]) {
            new_data.push(this.eventSubCondtionRecursion(condition))
          }
        } catch (err) {
          console.log(err);
          return this.error(err.message);
        }
        condition_data["conditions"] = new_data;
        temp["conditions"] = condition_data;
        // for condition_key, condition in enumerate(step["children"]):
        //     new_data.append(self.make_event_sub_condtion(condition))
        // condition_data["conditions"] = new_data
        // temp["conditions"] = condition_data
        step_list['step' + step_key + '_'] = temp
      }
      var data = {
        "formula": formula,
        "agg_by": step_list
      }
      return this.success(data);
    },
    /**
     * 事件子条件递归处理
     */
    eventSubCondtionRecursion: function(condition) {
      if (condition.group_type == 'attr') { //属性  直接生成最终条件
        return this.getEventLeafCondition(condition);
      } else {
        var logic_op = condition.logic_op;
        var data = {
          "is_group": true,
          "logic_op": logic_op,
          "conditions": [],
        }
        for (var child of condition["children"]) {
          data["conditions"].push(this.eventSubCondtionRecursion(child));
        }
        return data
      }
    },
    /**
     * @param {Object} leaf  事件子条件的最终叶子条件
     */
    getEventLeafCondition: function(leaf) {
      if (leaf.value_array.length == 0) {
        throw new Error('请选择条件属性');
      }
      var temp = {};
      temp.is_group = false;
      var isEvent = leaf["value_array"][0] == 'EVENT';
      temp["op"] = leaf["op"]
      temp["obj_type"] = leaf["value_array"][0];
      var old_value_array = JSON.parse(JSON.stringify(leaf["value_array"])); //留着编辑的时候用这个完整参数
      leaf["value_array"].shift();
      if (isEvent) {
        if (leaf["value_array"].length == 1) { //只有一个值 这个是总体
          temp["id"] = leaf["value_array"][0]
          temp["attr_id"] = ''
        } else {
          temp["id"] = leaf["value_array"][0]
          temp["attr_id"] = leaf["value_array"][1]
        }
      } else { // 用户属性的条件
        temp["id"] = leaf["value_array"][0]
        if (leaf["value_array"].length == 2) {
          temp["attr_id"] = leaf["value_array"][1]
        }
      }
      if (leaf['box_type'] == 'PHRASES') {
        if(leaf["field_type"] == 'NUMBER'){
          for(var i  in  leaf["in"]){
            this.check_number(leaf["in"][i], leaf['field_name']);
            leaf["in"][i] = parseInt(leaf["in"][i]) ;
          }
        }
        temp["values"] = leaf["in"];
      }

      if (leaf['box_type'] == 'PHRASE') {
        if (leaf["field_type"] == 'NUMBER') {
          this.check_number(leaf["start"], leaf['field_name']);
          leaf["start"] = parseInt(leaf["start"]) ;
        }
        temp["value"] = leaf["start"];
      }

      if (leaf['box_type'] == 'RANGE') {
        if (leaf["field_type"] == 'NUMBER') {
          this.check_number(leaf["start"], leaf['field_name']);
          this.check_number(leaf["end"], leaf['field_name']);
          leaf["start"] = parseInt(leaf["start"]) ;
          leaf["end"] = parseInt(leaf["end"]) ;
        }
        temp["start"] = leaf["start"];
        temp["end"] = leaf["end"];
      }
      if (leaf['box_type'] == 'PRESET') {
        temp["condition_type"] = 'PRESET';
      }
      leaf["value_array"] = old_value_array; //恢复参数 编辑的时候用这个参数
      return temp
    },
    /**
     * 事件筛选递归处理事件
     */
    eventWhereEventRecursion: function(step, new_step_list) {
      //如果是步骤组拼好这个步骤括号返回
      if (step.step_type == 'event_group') {
        if (step.step_children.length == 0) {
          return null;
        }
        var children = [];
        try{
          for (var sub_step of step.step_children) {
            var temp = this.eventWhereEventRecursion(sub_step, new_step_list);
            if (temp) {
              children.push(temp);
            }
          }
        }catch (err) {
            return this.error(err.message);
          }
        if (children.length == 0) {
          return null;
        }
        return '(' + children.join(step.step_logic) + ')';
      }

      //如果是条件组直接返回
      if (step.step_type == 'event') {
        new_step_list[step.id] = step;
        step["compare_value"] = parseInt(step["compare_value"]) ;
        return '(step' + step.id + '_' + step.compare_op + "'" + step["compare_value"] + "'" + ')';
      }
      if (step.step_type == 'formula') {
        if (step.formula_element.length == 0) {
          throw new Error("公式内容不允许为空");
        }
        var formula = '';
        step.formula_element.map((v) => {
          formula += v.value;
        });
        for (var sub_step of step.step_children) {
          new_step_list[sub_step.id] = sub_step;
        }
        return '(' + formula + ')';
      }
    },
    /**
     * @param {Object} value
     * 属性筛选
     */
    userWhere: function(value) {
      var where = JSON.parse(JSON.stringify(value));
      var conditions = {
        "logic_op": where["logic_op"],
        "is_group": true,
      };
      var children = [];
      try {
        for (var condition of where["children"]) {
          children.push(this.make_sub_user_condtion(condition));
        }
      } catch (err) {
        console.log(err);
        return this.error(err.message);
      }
      conditions["conditions"] = children;
      return this.success(conditions);
    },
    /**
     * @param {Object} condition
     */
    make_sub_user_condtion: function(condition) { //属性筛选递归处理
      if (condition["group_type"] != 'logic_group') { //如果不是逻辑组是叶子节点
        return this.user_leaf_condition(condition);
      } else {
        var data = {
          "is_group": true,
          "logic_op": condition["logic_op"],
          "conditions": [],
        };
        for (var child of condition["children"]) {
          data["conditions"].push(this.make_sub_user_condtion(child));
        }
        if (data["conditions"].length == 0) {
          throw new Error("逻辑组中至少需要有一个条件!");
        }
        return data
      }
    },
    user_leaf_condition: function(leaf) { //属性筛选处理叶子节点
      var temp = {};
      temp["is_group"] = false;
      temp["op"] = leaf["op"];
      if (leaf.hasOwnProperty('range_attr')) {
        temp["range_agg"] = leaf["range_attr"];
      }
      if (leaf["value_array"].length == 0) {
        throw new Error("请选择条件！");
      }
      temp["id"] = leaf["value_array"][0];
      if (leaf["value_array"].length == 2) {
        temp["attr_id"] = leaf["value_array"][1];
      }
      temp["real_value"] = leaf.hasOwnProperty('real_value') ?  leaf['real_value']: '' ;
      temp["parent_id"] = leaf.hasOwnProperty('parent_id') ?  leaf['parent_id']: '' ;

      if (leaf['box_type'] == 'PHRASES') {
        if(leaf["field_type"] == 'NUMBER'){
          for(var i  in  leaf["in"]){
            this.check_number(leaf["in"][i], leaf['field_name']);
            leaf["in"][i] = parseInt(leaf["in"][i]) ;
          }
        }
        temp["values"] = leaf["in"];
      }

      if (leaf['box_type'] == 'PHRASE') {
        if (leaf["field_type"] == 'NUMBER') {
          this.check_number(leaf["left"], leaf['field_name']);
          leaf["left"] = parseInt(leaf["left"]) ;
        }
        temp["value"] = leaf["left"];
      }

      if (leaf['box_type'] == 'RANGE') {
        if (leaf["field_type"] == 'NUMBER') {
          this.check_number(leaf["left"], leaf['field_name']);
          this.check_number(leaf["right"], leaf['field_name']);
          leaf["left"] = parseInt(leaf["left"]) ;
          leaf["right"] = parseInt(leaf["right"]) ;
        }
        temp["start"] = leaf["left"];
        temp["end"] = leaf["right"];
      }
      if (leaf['box_type'].toUpperCase() == 'PRESET') {
        temp["condition_type"] = 'PRESET';
      }
      temp.field_type = leaf.field_type ;
      if(temp.field_type == 'LIST_MAP' && leaf.children.length > 0){
        var data = {
          "is_group": true,
          "logic_op": leaf["logic_op"],
          "conditions": [],
        };
        for (var child of leaf["children"]) {
          data["conditions"].push(this.user_leaf_condition(child));
        }
        temp.is_group = data.is_group ;
        temp.logic_op = data.logic_op ;
        temp.conditions = data.conditions ;
      }
      return temp;
    },
    /**
     * 日志过滤关键词参数
     */
    keywords:function(value){
      var where = JSON.parse(JSON.stringify(value));
      var conditions = {
        "logic_op": where["logic_op"],
        "is_group": true,
      };
      var children = [];
      try {
        for (var condition of where["children"]) {
          children.push(this.keywords_recursion(condition));
        }
      } catch (err) {
        console.log(err);
        return this.error(err.message);
      }
      conditions["conditions"] = children;
      return this.success(conditions);
    },
    /**
     * 递归关键词
     * @param {Object} condition
     */
    keywords_recursion: function(condition) { //属性筛选递归处理
      if (condition["group_type"] != 'logic_group') { //如果不是逻辑组是叶子节点
        return this.keywords_leaf(condition);
      } else {
        var data = {
          "is_group": true,
          "logic_op": condition["logic_op"],
          "conditions": [],
        };
        for (var child of condition["children"]) {
          data["conditions"].push(this.keywords_recursion(child));
        }
        if (data["conditions"].length == 0) {
          throw new Error("逻辑组中至少需要有一个条件!");
        }
        return data
      }
    },
    /**
     * 关键词叶子节点
     * @param {Object} leaf
     */
    keywords_leaf: function(leaf) { //属性筛选处理叶子节点
      var temp={};
      temp["is_group"] = false;
      temp["value"] = leaf["value"];
      if(!temp["value"]){
        throw new Error("关键词不允许为空");
      }
      return temp;
    },
    linkageSingle: function(value) {
      return this.success(value);
    },
    //事件分组
    eventGroup: function(value) {
      let values = JSON.parse(JSON.stringify(value));
      let group_by = {}
      let event_attrs = [];
      let snapshot_attrs = [];
      var alias_map = {} ;
      for (let value of values) {
        var alias =   value.value.join('_')  ;
        if (alias_map.hasOwnProperty(alias)) {
          return this.error("分组指标不允许重复,请删除重复的指标") ;
        } else {
          alias_map[alias] = alias ;
        }
        let param = {}
        if (value.intValue == 'custom') {
          param = value.customs;
        }
        if (value.intValue == 'interval') {
          param = value.interval;
          param.start = parseInt(param.start ) ;
          param.end = parseInt(param.end ) ;
          param.interval = parseInt(param.interval ) ;
          let num = (param.end-param.start)/param.interval;
          if(num>100) {
            if(value.name_array) {
              return this.error(`分组【${value.name_array[value.name_array.length-1]}】等间距区间数量不能大于100`) ;
            }else{
              return this.error(`分组【${value.value[value.value.length-1]}】等间距区间数量不能大于100`) ;
           }
          }
          if(isNaN( param.start)){
            return this.error("等间距开始值需要是整数值")
          }
          if(isNaN(  param.end )){
            return this.error("等间距结束值需要是整数值")
          }
          if(isNaN( param.interval)){
            return this.error("等间距区间值需要是整数值")
          }
          if(param.interval <= 0){
            return this.error("等间距区间值需要大于0") ;
          }
          if(param.start>=param.end){
            return this.error("等间距区间结束值需要大于开始值") ;
          }
        }
        let group = {
          attr_id: value.value[value.value.length - 1],
          type: value.intValue,
          param: param,
          range_agg: value.range_agg,
        }

        if (group.attr_id == null) {
          return this.error("请选择分组类别")
        }

        if (group.type == "custom") {
          if (group.param.length < 1) {
            return this.error("自定义区间设置不正确")
          }
          group.param[group.param.length - 1].end = "";
        }

        if (value.group_by_type.value == 'EVENT') {
            event_attrs.push(group);
          } else if (value.group_by_type.value == 'OBJECT_DAY') {
            snapshot_attrs.push(group);
          } else {
            return this.error("分组类型选择错误")
          }
      }

      group_by.event_attrs = event_attrs;
      group_by.snapshot_attrs = snapshot_attrs;

      return this.success(group_by);
    },
    //模块内联动
    moduleLinkage: function(value) {
      var value = JSON.parse(JSON.stringify(value));
      if (!value) {
        return this.error("请选择属性类型");
      }
      return this.success(value);
    },
    moduleLinkageSuffix: function(value) {
      var value = JSON.parse(JSON.stringify(value));
      if (!value) {
        return this.error("请选择属性类型");
      }
      return this.success(value);
    },
    //属性聚合
    userAgg: function(value) {
      var value = JSON.parse(JSON.stringify(value));
      var aggs = [];
      var alias_map = {};
      for (var agg of value) {
        if (agg.value_array.length == 0) {
          return this.error("请选择指标");
        }
        var field_type = agg["field_type"];
        var temp = {};
        temp["agg"] = agg["agg"];
        if (agg.hasOwnProperty('range_attr')) {
          temp["range_agg"] = agg["range_attr"];
        }
        if (field_type == 'preset') {
          temp["type"] = 'PRESET';
          if (agg["alias"] != '') {
            agg["alias"] = agg["alias"].trim()
            temp['alias'] = agg["alias"]
          } else {
            temp['alias'] = agg["field_name"]
          }
        } else {
          temp["type"] = 'METRIC';
          var range = '';
          if (agg.hasOwnProperty('range_attr_name') && agg.range_attr_name != '') {
            range = '_' + agg.range_attr_name;
          }
          if (agg.alias != '') {
            agg["alias"] = agg["alias"].trim();
            // check_alias(agg["alias"]);
            temp['alias'] = agg["alias"];
          } else {
            temp['alias'] = agg["field_name"] + range + '_' + agg["agg_name"];
          }
          temp["id"] = agg.value_array[0];
          if (agg.value_array.length > 1) {
            temp["attr_id"] = agg.value_array[1];
          }
        }
        if (alias_map.hasOwnProperty(temp["alias"])) {
          return this.error(temp["alias"] + "已存在,请删除一个")
        } else {
          alias_map[temp["alias"]] = temp["alias"]
        }
        aggs.push(temp);
      }
      if (aggs.length == 0) {
        return this.error('请至少选择一个指标');
      }
      return this.success(aggs);
    },

    attrIndicators: function(value) {
      var value = JSON.parse(JSON.stringify(value));
      var aggs = [];
      var alias_map = {};
      for (var agg of value) {
        if (agg.value_array.length == 0) {
          return this.error("请选择指标");
        }
        var field_type = agg["field_type"];
        var temp = {};
        temp["agg"] = agg["agg"];
        if (agg.hasOwnProperty('range_attr')) {
          temp["range_agg"] = agg["range_attr"];
        }
        if (field_type == 'preset') {
          temp["type"] = 'PRESET';
          if (agg["alias"] != '') {
            agg["alias"] = agg["alias"].trim()
            temp['alias'] = agg["alias"];
            try {
              this.check_alias(agg["alias"]);
            } catch (err) {
              return this.error(err.message);
            }
          } else {
            temp['alias'] = agg["field_name"]
          }
        } else {
          temp["type"] = 'METRIC';
          var range = '';
          if (agg.hasOwnProperty('range_attr_name') && agg.range_attr_name != '') {
            range = '_' + agg.range_attr_name;
          }
          if (agg.alias != '') {
            agg["alias"] = agg["alias"].trim();
            try {
              this.check_alias(agg["alias"]);
            } catch (err) {
              return this.error(err.message);
            }
            temp['alias'] = agg["alias"];
          } else {
            temp['alias'] = agg["field_name"] + range + '_' + agg["agg_name"];
          }
          temp["id"] = agg.value_array[0];
          if (agg.value_array.length > 1) {
            temp["attr_id"] = agg.value_array[1];
          }
        }
        if (alias_map.hasOwnProperty(temp["alias"])) {
          return this.error(temp["alias"] + "已存在,请删除一个")
        } else {
          alias_map[temp["alias"]] = temp["alias"]
        }
        //假如是 LIST_MAP类型的时候拼接子条件参数
        temp.field_type = agg["field_type"];
        temp.parent_field_type = agg["parent_field_type"];
        if(agg["parent_field_type"] == 'LIST_MAP' && agg.children.length>0){
          var data = {
            "is_group": true,
            "logic_op": agg["logic_op"],
            "conditions": [],
          };
          try {
            for (var child of agg["children"]) {
              data["conditions"].push(this.user_leaf_condition(child));
            }
          } catch (err) {
            console.log(err);
            return this.error(err.message);
          }
          temp.conditions = data ;
        }
        aggs.push(temp);
      }
      if (aggs.length == 0) {
        return this.error('请至少选择一个指标');
      }
      return this.success(aggs);
    },

    attrDimension: function(value){
      var value = JSON.parse(JSON.stringify(value));
      var aggs = [];
      var alias_map = {};
      for (var agg of value.agg_list) {
        if (agg.value_array.length == 0) {
          return this.error("请选择指标");
        }
        var field_type = agg["field_type"];
        var temp = {};
        if (agg.hasOwnProperty('range_attr')) {
          temp["range_agg"] = agg["range_attr"];
        }
        if (field_type == 'preset') {
          temp["type"] = 'PRESET';
          temp['alias'] = agg["field_name"]
        } else {
          temp["type"] = 'METRIC';
          var range = '';
          if (agg.hasOwnProperty('range_attr_name') && agg.range_attr_name != '') {
            range = '_' + agg.range_attr_name;
          }
          temp["id"] = agg.value_array[0];
          if (agg.value_array.length > 1) {
            temp["attr_id"] = agg.value_array[1];
          }
          if(value.attr_type == 'OBJECT_DAY'){
            temp['alias'] = agg["field_name"] + range;
          } else {
            temp['alias'] = agg["field_name"]
          }

        }
        if (alias_map.hasOwnProperty(temp["alias"])) {
          return this.error(temp["alias"] + "已存在,请删除一个")
        } else {
          alias_map[temp["alias"]] = temp["alias"]
        }
        aggs.push(temp);
      }
      if (aggs.length == 0) {
        return this.error('请至少选择一个指标');
      }
      let dims = {}
      if(value.attr_type == 'OBJECT_DAY'){
        dims = {
          aggs: aggs,
          attr_type: value.attr_type,
          time_type: value.time_type,
          time: value.timer
        }
      } else {
        dims = {
          aggs: aggs,
          attr_type: value.attr_type,
        }
      }

      return this.success(dims);
    },

    moduleLinkageConfigurable: function(value){
      return this.success(value)
    },

    timeUnit: function(value){
      return this.success(value)
    },

    timeSingle: function(value) {
      return this.success(value);
    },
    //时间范围
    timer: function(value) {
      var value = JSON.parse(JSON.stringify(value));

      if (value.type == 'STATIC') {
        if (value.start == '') {
          return this.error("时间范围请选择正确的时间");
        }
      } else {
        if (value.dynamic_time == '') {
          return this.error("时间范围请选择正确的时间");
        }
      }
      delete(value.range);
      return this.success(value);
    },
      //时间精确到小时
    timeDetail: function (value) {
      var value = JSON.parse(JSON.stringify(value));

      if (value.type == 'STATIC') {
        if (value.start == '') {
          return this.error("时间范围请选择正确的时间");
        }
      } else {
        if (value.dynamic_time == '') {
          return this.error("时间范围请选择正确的时间");
        }
      }
      delete(value.range);
      return this.success(value);
    },
    /**
     * @param {Object} values
     * 属性分组 提交参数拼接
     */
    attrGroup: function(values) {
      var  values = JSON.parse(JSON.stringify(values))
      let group_by = [] ;
      var alias_map = {};
      for (let value of values) {
        var alias =   value.value.join('_')  ;
        if (alias_map.hasOwnProperty(alias)) {
          return this.error("分组指标不允许重复,请删除重复的指标") ;
        } else {
          alias_map[alias] = alias ;
        }
        let param = {}
        if (value.intValue == 'custom') {
          param = value.customs;
        }
        if (value.intValue == 'interval') {
         param = value.interval;
         param.start = parseInt(param.start ) ;
         param.end = parseInt(param.end ) ;
         param.interval = parseInt(param.interval ) ;
         let num = (param.end-param.start)/param.interval;
         if(num>100) {
          if(value.name_array) {
            return this.error(`分组【${value.name_array[value.name_array.length-1]}】等间距区间数量不能大于100`) ;
          }else{
            return this.error(`分组【${value.value[value.value.length-1]}】等间距区间数量不能大于100`) ;
         }
        }
         if(isNaN( param.start)){
           return this.error("等间距开始值需要是整数值")
         }
         if(isNaN(  param.end )){
           return this.error("等间距结束值需要是整数值")
         }
         if(isNaN( param.interval)){
           return this.error("等间距区间值需要是整数值")
         }
         if(param.interval <= 0){
           return this.error("等间距区间值需要大于0") ;
         }
         if(param.start>=param.end){
           return this.error("等间距区间结束值需要大于开始值") ;
         }
        }
        let group = {
          attr_id: value.value[value.value.length - 1],
          type: value.intValue,
          param: param,
          range_agg: value.range_agg,
        }

        if (group.attr_id == null) {
          return this.error("请选择分组类别")
        }

        if (group.type == "custom") {
          if (group.param.length < 1) {
            return this.error("自定义区间设置不正确")
          }
          group.param[group.param.length - 1].end = "";
        }
        group_by.push(group)
      }
      return this.success(group_by);
    },
    /**
     * @param {Object} values事件指标
     */
    eventIndicators: function(values) {
      let aggs = [];
      var alias_map = {};
      for (let i in values) {
        if (values[i].eventGroupValue.length < 1) {
          return this.error("请选择指标")
        }

        var conditions = {
          "is_group": true,
          "logic_op": values[i]["logic_op"],
          "conditions": [],
        };
        try {
          for (let index in values[i].step_children) {
            conditions.conditions.push(this.generateEventAggCondition(values[i].step_children[index]))
          }
        } catch (err) {
          console.log(err);
          return this.error(err.message);
        }

        var attr_id = '';
        if (values[i].eventGroupValue.length == 4) {
          attr_id = values[i].eventGroupValue[3]
        }

        var type = ''
        var agg = ''
        if (values[i].field_type == 'preset') {
          type = 'PRESET';
          agg = values[i].eventGroupValue[2]
        } else {
          type = 'METRIC';
          agg = values[i].agg_value;
        }

        var alias = '';
        if (values[i].alias == '') {
          alias = values[i].name_array.join("_");
          if (type == 'METRIC') {
            alias += '_' + values[i].agg_name;
          }
        } else {
          alias = values[i].alias;
          try {
            this.check_alias(alias);
          } catch (err) {
            return this.error(err.message);
          }
        }

        var agg = {
          agg: agg,
          type: type,
          alias: alias,
          event_id: values[i].eventGroupValue[1],
          id: values[i].eventGroupValue[2],
          attr_id: attr_id,
          conditions: conditions
        }
        if ('object_behavior' == values[i].eventGroupValue[0]) {
          agg.object_behavior = values[i].eventGroupValue[1];
          agg.event_id = '';
        }
        if (alias_map.hasOwnProperty(agg["alias"])) {
          return this.error(agg["alias"] + "已存在,请删除一个")
        } else {
          alias_map[agg["alias"]] = agg["alias"]
        }
        aggs.push(agg);
      }
      let agg_by = {
        aggs: aggs
      };
      return this.success(agg_by)
    },
    generateEventAggCondition(step_children) {
      let is_group = step_children.step_type == 'event_group' ? true : false;
      let condition = {};
      if (is_group) {
        let conditions = []
        for (let index in step_children.step_children) {
          let subCondition = this.generateEventAggCondition(step_children.step_children[index]);
          conditions.push(subCondition);
        }
        condition = {
          is_group: is_group,
          logic_op: step_children.logic_op,
          conditions: conditions
        }
      } else {
        if (step_children.op == '') {
          throw new Error("请选择操作符!");
        }
        if (step_children.value_array[step_children.value_array.length - 1] == '') {
          throw new Error("请选择属性!");
        }
        var attr_id = '';
        if (step_children.value_array.length == 3) {
          attr_id = step_children.value_array[2]
        }
        condition = {
          is_group: step_children.is_group,
          op: step_children.op,
          obj_type: step_children.value_array[0],
          id: step_children.value_array[1],
          attr_id: attr_id
        }
        if (step_children.box_type == "PHRASES") {
          if (step_children.in.length < 1) {
            throw new Error("指标参数填写不完全,请检查后补齐!");
          }
          if(step_children["field_type"] == 'NUMBER'){
            for(var i  in  step_children["in"]){
              this.check_number(step_children["in"][i], step_children['field_name']);
              step_children["in"][i] = parseInt(step_children["in"][i]) ;
            }
          }
          condition.values = step_children.in;
        }
        if (step_children.box_type == "PHRASE") {
          if (step_children.left === '') {
            throw new Error("指标参数填写不完全,请检查后补齐!");
          }
          if(step_children["field_type"] == 'NUMBER'){
            this.check_number(step_children["left"], step_children['field_name']);
            step_children["left"] = parseInt(step_children["left"]) ;
          }
          condition.value = step_children.left;
        }
        if (step_children.box_type == "RANGE") {
          if (step_children.left === '' || step_children.right === '') {
            throw new Error("指标参数填写不完全,请检查后补齐!");
          }
          if(step_children["field_type"] == 'NUMBER'){
            this.check_number(step_children["right"], step_children['field_name']);
            this.check_number(step_children["left"], step_children['field_name']);
            step_children["left"] = parseInt(step_children["left"]) ;
            step_children["right"] = parseInt(step_children["right"]) ;
          }
          condition.start = step_children.left;
          condition.end = step_children.right;
        }
      }
      return condition;
    },

    retainedEvent: function(values) {
      let event = JSON.parse(JSON.stringify(values));
      if(event.title == '' ||  event.title.length==0){
        return this.error("留存初始事件和回访事件不允许为空");
      }
      let is_group = event.conditions.length > 0 ? true : false
      let conditions = []
      try {
        for (let condition of event.conditions) {
          let sub = {}
          if(event.title[0] == 'object_behavior'){
            sub = this.generateRetainedCondition(condition, "OBJECT_BEHAVIOR")
          } else {
            sub = this.generateRetainedCondition(condition, event.obj_type)
          }
          conditions.push(sub)
        }
      } catch (err) {
        console.log(err);
        return this.error(err.message);
      }

      let param = {
        event_id: event.title[1],
        conditions: {
          is_group: is_group,
          logic_op: event.logic,
          conditions: conditions,
        }
      }
      if(event.title[0] == 'object_behavior'){
        param.event_id = ''
        param.object_behavior = event.title[1]
      }
      return this.success(param)
    },

    generateRetainedCondition(condition, obj_type) {
      let attr_id = condition.value.length > 1 ? condition.value[1] : ""
      let sub = {
        is_group: false,
        op: condition.op,
        obj_type: obj_type,
        id: condition.value[0],
        attr_id: attr_id
      }

      if (condition.box_type == "PHRASES") {
        if (condition.in.length < 1) {
          throw new Error("指标参数填写不完全,请检查后补齐!");
        }
        if(condition["field_type"] == 'NUMBER'){
          for(var i  in  condition["in"]){
            this.check_number(condition["in"][i], condition['field_name']);
            condition["in"][i] = parseInt(condition["in"][i]) ;
          }
        }
        sub.values = condition.in;
      }
      if (condition.box_type == "PHRASE") {
        if (condition.left == '') {
          throw new Error("指标参数填写不完全,请检查后补齐!");
        }
        if(condition["field_type"] == 'NUMBER'){
          this.check_number(condition["left"], condition['field_name']);
          condition["left"] = parseInt(condition["left"]) ;
        }
        sub.value = condition.left;
      }
      if (condition.box_type == "RANGE") {
        if (condition.left == '' || condition.right == '') {
          throw new Error("指标参数填写不完全,请检查后补齐!");
        }
        if(condition["field_type"] == 'NUMBER'){
          this.check_number(condition["left"], condition['field_name']);
          this.check_number(condition["right"], condition['field_name']);
          condition["left"] = parseInt(condition["left"]) ;
          condition["right"] = parseInt(condition["right"]) ;
        }
        sub.start = condition.left;
        sub.end = condition.right;
      }
      return sub
    },
    /**
     * @param {Object} aggs
     * @param {Object} group_by
     * 判断 指标  和 分组 字段是否有重复
     */
    compareAggAndGroup(aggs,group_by){
      var agg_names =[];
      var group_by_list= [];
      try{
        for(var agg of aggs){
          agg_names.push(agg.alias) ;
        }
        for(var v of group_by){
          group_by_list.push(v.name_array[v.name_array.length-1]) ;
        }
        for(var v of group_by_list){
          if(agg_names.indexOf(v) >= 0){
            return this.error("指标别名不能和分组字段重复【"+v+"】");
          }
        }
      }catch (err) {
        // 兼容旧的数据 不报错
        return this.success([]) ;
      }
      return this.success([]) ;
    },
    retainedTime: function(values) {
      let v = JSON.parse(JSON.stringify(values))
      let time = {
        type: v.type,
        dynamic_time: v.dynamic_time,
        start: v.start,
        end: v.end,
        time_type: v.time_type,
        range: v.range,
        analyze_type: v.analyze_type
      }
      return this.success(time)
    },
    /**
     * @param {Object} values
     * 漏斗步骤
     */
    funnel:function(values){
      var values =   JSON.parse(JSON.stringify(values)) ;
      if(values.length<2){
        return this.error("漏斗步骤不能小于2个");
      }
      var  step_list = [] ;
      for (var v of values) {
        if (v.value_array.length < 1) {
          return this.error("请选择事件")
        }
        var step = {
          'event_id':v.event_id,
          'is_object_behavior':v.is_object_behavior ? true : false ,
        }
        //拼子条件
        var condition_data = {
          'is_group': true,
          'logic_op': v["logic_op"],
        }
        try {
          var new_data = []; //递归拼接子条件
          for (var condition of v["children"]) {
            new_data.push(this.eventSubCondtionRecursion(condition))
          }
        } catch (err) {
          console.log(err);
          return this.error(err.message);
        }
        condition_data["conditions"] = new_data;
        step["conditions"] = condition_data ;
        step_list.push(step) ;
      }
      return this.success(step_list) ;
    },
    /**
     * 漏斗窗口期
     */
    windowPeriod:function(value){
      var value = JSON.parse(JSON.stringify(value));
      if (value.type == 'STATIC') {
        if (value.start == '') {
          return this.error("时间范围请选择正确的时间");
        }
      } else {
        if (value.dynamic_time == '') {
          return this.error("时间范围请选择正确的时间");
        }
      }
      return this.success(value);  
    },
    error(msg) {
      return {
        status: false,
        message: msg,
      }
    },
    success(data) {
      return {
        status: true,
        value: data,
      }
    },
    check_alias(alias){
      var patt =  /\s/
      var n = alias.search(patt);
      if(n>=0){
        throw new Error("别名必须以中文或字母开头结尾，只能包含中文字母下划线1" +'【'+alias+'】'); //有空格提示
      }

      //匹配 不是 汉字字母数字下换线的其他字符
      var patt =  /[^A-Za-z\u4e00-\u9fa5_0-9]/ ;
      var n = alias.search(patt);
      if(n>=0){
        throw new Error("别名必须以中文或字母开头结尾，只能包含中文字母下划线数字2" +'【'+alias+'】'); //有空格提示
      }



      var patt = /^[A-Za-z\u4e00-\u9fa5][0-9_A-Za-z\u4e00-\u9fa5]*[0-9A-Za-z\u4e00-\u9fa5]$/;
      var rs = patt.test(alias);
      if(!rs){
        throw new Error("别名必须以中文或字母开头结尾，只能包含中文字母下划线数字3" +'【'+alias+'】');
      }
    }
  },

}
export default tools
