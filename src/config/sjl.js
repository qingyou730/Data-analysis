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
  }

}
