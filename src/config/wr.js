export default {
  "menu": {
    "list": "/app/menu/list", //菜单列表页接口
    "add": "/app/menu/add", //菜单添加接口
    "detail": "/app/menu/find_detail/", //菜单详情接口地址
    "delete": "/app/menu/del/", //菜单删除接口
    "api_list": "/app/menu/apis", //所有接口列表
  },
  "auth": {
    "login": "/app/auth/login", //登录
    "logout": "/app/auth/logout", //退出
  },
  "role": {
    "list": "/app/auth/role/list", //列表页接口
    "add": "/app/auth/role/add", //添加接口
    "update": "/app/auth/role/update", //修改接口
    "detail": "/app/auth/role/find_by_id", //详情接口地址
    "delete": "/app/auth/role/delete", //删除接口
  },
  "department": { //部门
    "list": "/app/auth/group/list", //列表页接口
    "add": "/app/auth/group/add", //添加接口
    "delete": "/app/auth/group/delete", //删除接口
    "detail": "/app/auth/group/find_by_id", //部门详情页面
    "update": "/app/auth/group/update", //修改接口
  },
  "game": {
    "list": "/app/auth/game/list", //列表页接口
    "add": "/app/auth/game/add", //添加接口
  },
  "admin": {
    "list": "/app/auth/user/list", //列表页接口
    "add": "/app/auth/user/add", //添加接口
    "update": "/app/auth/user/update", //修改接口
    "detail": "/app/auth/user/find_by_id", //详情接口地址
    "delete": "/app/auth/user/delete", //删除接口
    "login_user": "/app/auth/user/detail", //获取当前登录的你管理员
    "change_pwd": "/app/auth/user/change_pwd", //修改密码
    "enabled": "/app/auth/user/enabled",
    "open_game": "/app/auth/user/open_game",
    "close_game": "/app/auth/user/close_game",
    "update_role": "/app/auth/user/update_role",
    "all_user": "/app/auth/user/query",
  },
  "task": {
    "modules_detail": "/app/model/find_modules_detail/", //多个模块列表详情
    "components_detail": "/app/model/find_components_detail/", //多个业务组件详情
    "task_submit": "/mmp/task/submit/", //多个业务组件详情
    "progress": "/mmp/task/find_task_progress", //查询任务进度接口
    "kill_task": "/mmp/task/kill_task/", // 取消任务
    "find_data": "/mmp/task/find_data", //任务获取数据
    "find_sql": "/mmp/task/find_task_by_ids", //任务获取sql
    "find_model_detail": "/app/model/find_model_detail", // 模型详情列表页
    "create_timed_task": "/mmp/task/create_timed_task", //创建定时任务
    "model_create_group": "/mmp/group/model_create", //
    "timed_task_detail": "/mmp/task/find_timed_task_detail", //定时任务详情
    "timed_task_enable": "/mmp/task/disable_timed_task", //定时任务详情
    "history":"/mmp/task/find_time_task_by_ids",//定时任务运行记录
    "event_attr":"/mmp/task/find_event_attr_mapping" ,
    "get_csv_path":"/mmp/task/get_task_data_file_path",
    "get_file" : "/file/get",
    'is_private': "/mmp/task/is_private",//我的分析参看权限权限
    'delete_task': '/mmp/task/delete_task',//我的分析删除
    'is_private_time_task': '/mmp/task/is_private_time_task',//定时任务参看权限
    'get_column':"/mmp/task/get_task_table_column", //获取任务字段
  },
  view: {
    "list": "/mmp/taskView/find_task_views", //视图列表
    "search_list": "/mmp/taskView/find_views_by_keywords", //搜索接口
    "create_view": "/mmp/taskView/create_task_view/", //创建视图
    "detail": "/mmp/taskView/find_view_detail", //视图详情
    "view_users": "/mmp/taskView/find_view_users", //视图有权限的人,
    "update_view_users": "/mmp/taskView/update_view_users", //修改权限接口
    "delete": "/mmp/taskView/delete_timed_task", //删除视图
  },
  sql: {
    "submit_sql_download": "/mmp/sql/submit_sql_download", //sql提交下载地址
    "sql_status":"/mmp/sql/find_sql_status",//查询sql的状态
    "sql_result":"/mmp/sql/find_sql_results",//查询sql的状态

  },
  "manage": {
    "visit_count": "/manager/hide/hide_handle/", //埋点访问统计
  },
  "job": {
    "yarn_log": "/job/get_job_yarn_logs", //埋点访问统计
    "task_list":"/job/query_records",  //任务列表
    "tag_list" : "/job/query_tags" , //tag列表
  },
  "hdfs": {
    "list": "/manager/hdfs/hdfs", //HDFS列表
    "add_log_filter":'/manager/hdfs/submit_filter_game_logs' ,//日志筛选提交任务
    "hdfs_log_list":'/manager/hdfs/filter_game_log_list' ,//日志筛选提交任务
    "log_type":'/manager/hdfs/find_games_logs_type ',
    "detail":"/manager/hdfs/filter_game_logs_detail",
  },
  "version": {
    "list": "/mmp/version/get_version_record_list", //版本列表
    "add":'/mmp/version/submit_version_record' ,//添加
    "delete":"/mmp/version/delete_version_record" ,//删除
    "detail":"/mmp/version/get_version_detail" //详情
  },
  "funnel":{
    "create_group":"/mmp/task/create_funnel_group",//漏斗保存群组
  },
  "report":{
    "create":"/mmp/report/add_custom_report" , //创建自定义报表
  }
}
