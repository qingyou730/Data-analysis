export default {
  module: {
    "list": "/app/model/find_modules",
    "add": "/app/model/add_module",
    "edit": "",
    "delete": "/app/model/del_module/",
    "type": "/app/model/find_module_group",
    "detail":"/app/model/find_module_detail",
  },
  components: {
    "list": "/app/model/find_components",
    "add": "/app/model/add_component",
    "delete": "/app/model/del_component/",
    "detail": "/app/model/find_component_detail",
  },
  model: {
    "add": "/app/model/add_model",
    "list": "/app/model/find_models",
    "delete": "/app/model/del_model",
    'detail': "/app/model/find_model_detail"
  },
  game: {
    "list": "/app/authority/find_games"
  },
  keep: {
    "create_group": "/mmp/model/keep/create_group"
  },
  heightAnalysis: {
    "gameLogdownloadSearch": "/manager/hdfs/find_game_logs",
    "logType": "/manager/hdfs/find_games_logs_type",
    "createObjForm": "/mmp/sql/create_materialized_from_sql",
    "runSqlSearch" : "/mmp/sql/submit_sql_log",
    "stop_sql_task": "/mmp/sql/stop_sql_task",
    "delete_save_sql": "/mmp/sql/delete_save_sql_record",
    "sql_rename": "/mmp/sql/rename_save_sql",
    "sql_private": "/mmp/sql/set_save_sql_private",
    "sql_uptop": "/mmp/sql/set_save_sql_top",
    "cancel_sql_up": "/mmp/sql/unset_save_sql_top",
    "sql_list": "/mmp/sql/sql_list",
    "cancel_offline_sql": "/mmp/sql/cancel_offline_sql"
  },
  event: {//事件文档接口
    event_table_url: "/mmp/task/find_event_list",
  },
  custom: {
    find_file_list: "/mmp/report/find_report_folder_list",//查找文件夹列表
    rename_file: "/mmp/report/rename_report_folder",//重命名文件夹
    add_report: "/mmp/report/add_report",//新增自定义报表
    add_file: "/mmp/report/add_report_folder",//创建文件夹
    del_file: "/mmp/report/del_report_folder",// 删除文件夹
    custom_list: "/mmp/report/custom_report_list",// 自定义报表列表
    del_custom_list: "/mmp/report/del_custom_report",// 删除自定义报表
    move_custom: "/mmp/report/move_custom_report",// 移动自定义报表
    rename_custom: "/mmp/report/rename_custom_report",// 自定义报表重命名
    set_access_user:"/mmp/report/set_access_user",
    get_access_user:"/mmp/report/get_access_user",
  },
  dynamicDroup:{
    create_dynamic_group: "/mmp/object/create_dynamic_group_info",//创建动态群组
    del_dynamic_group: "/mmp/object/del_dynamic_group_info",//删除动态群组
    dynamic_group_list: "/mmp/object/dynamic_group_info_list",//动态群组列表
    find_dynamic_group: "/mmp/object/find_dynamic_group_info",//查找动态群组
    add_file: "/mmp/object/add_group_folder",//新增动态群组文件夹
    del_file: "/mmp/object/del_group_folder",//删除动态群组文件夹
    find_folder_list: "/mmp/object/find_group_folder_list",//动态群组文件夹列表
    move_dynamic_group: "/mmp/object/move_dynamic_group_info",//移动动态群组
    rename_dynamic_group: "/mmp/object/rename_dynamic_group_info",//重命名动态群组
    rename_group_folder: "/mmp/object/rename_group_folder",//重命名动态群组文件夹
    get_access_user:"/mmp/object/get_access_user",//文件夹已经被授权的用户查询
    set_access_user:"/mmp/object/set_access_user",
    object_type_list: "/mmp/model/base/object_type_list/",  //选着对象
    routine_bind_group: "/mmp/object/bind_dynamic_group",  //常规绑定动态群组
    get_routine_bind_group: "/mmp/object/get_bind_dynamic_group",  //常规获取动态群组
  },
  public_variable:{
    "add":"/mmp/object/add_public_param",
    "list":"/mmp/object/public_param_list",
    "delete":"/mmp/object/del_public_param",
    "detail":"/mmp/object/find_public_param",
  },
 

}
