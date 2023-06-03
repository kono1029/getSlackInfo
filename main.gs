// Slack API
const SLACK_API_URL = "https://slack.com/api/";
const USERS_LIST = SLACK_API_URL + "users.list";
const CONVERSATIONS_LIST = SLACK_API_URL + "conversations.list";
const CONVERSATIONS_HISTORY = SLACK_API_URL + "conversations.history";
const TEAM_INFO = SLACK_API_URL + "team.info";
const USERGROUPS_LIST = SLACK_API_URL + "usergroups.list";

// Bot User OAuth Token
const BOT_TOKEN = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");

// SlackAPI呼び出し
let payload = {
  'token':BOT_TOKEN,
  'limit':500
};
let params = { 'method': 'get', 'contentType': 'application/x-www-form-urlencoded', 'payload': payload };
let url, response, teams, members, channels;

//　配列
let usersArr = [], groupsArr = [], teamsArr = [], channelsArr = [];

// スプレッドシート
const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const SHEET_USERS_LIST = SPREADSHEET.getSheetByName('ユーザー');
const SHEET_CHANNELS_LIST = SPREADSHEET.getSheetByName('チャンネル');
const SHEET_USERGROUPS_LIST = SPREADSHEET.getSheetByName('ユーザーグループ');
const SHEET_WORKSPACES = SPREADSHEET.getSheetByName('ワークスペース');

/** タイムスタンプを日付形式に変換する */ 
function formatTimestamp(timestamp) {
  // ミリ秒単位のタイムスタンプを「Sat May 13 2023 13:28:33 GMT+0900 (Japan Standard Time)」の形式に変換
  const date = new Date(timestamp);

  // 「yyyy/mm/dd」の形式に変換して返す
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}/${month}/${day}`;
}

/** SlackAPIの呼び出し */
function callApi(url, params) {
  let response = UrlFetchApp.fetch(url, params);
  let resjson = JSON.parse(response.getContentText());
  console.log(resjson);
  if (resjson.ok !== true) { // エラーハンドリング
    console.log('エラー：' + resjson['error']);
    throw new Error(resjson['error']);
  }
  return response;
}