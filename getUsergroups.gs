/** ユーザーグループの取得 */
function getUsergroups(cursor) {
    /** SlackAPI呼び出し */
    // ワークスペース
    url = TEAM_INFO;
    response = callApi(url, params);
    teams = JSON.parse(response).team;
  
    let teams_name = teams.name; // ワークスペース名
    let teams_id = teams.id; // ワークスペースID
  
    /** Enterprise Grid以外の場合 */
    // 配列にワークスペースの情報を格納する
    teamsArr.push([ teams_name, teams_id ]);
  
    /** Enterprise Gridの場合
    for (const team of teams) {
      teams_name = teams.name; // ワークスペース名
      teams_id = teams.id; // ワークスペースID
      
      // 配列にワークスペースの情報を格納する
      teamsArr.push([ teams_name, teams_id ]);
      } */
  
    // ユーザー
    url = USERS_LIST;
    response = callApi(url, params);
    members = JSON.parse(response).members;
    
    for (const member of members) {
      let member_real_name = member.profile.real_name; // 氏名
      let member_id = member.id; // ユーザーID
      let deleted = member.deleted; // アカウントの状態の判定
  
      // アクティブなメンバーのみリストに追加する
      if(!deleted){
        usersArr.push([ member_real_name, member_id ]);
      }
    }
  
    params.payload.cursor = cursor;
    url = USERGROUPS_LIST;
    response = callApi(url, params);
    usergroups = JSON.parse(response).usergroups;
    
    for (const usergroup of usergroups) {
      let usergroup_name = usergroup.name; // 名前
      let handle = usergroup.handle; // ハンドル
      let usergroup_id = usergroup.id; // ユーザーグループID
      let usergroup_team_id = usergroup.team_id; // ワークスペース
      let description = usergroup.description; // 説明
      let usergroup_channels = usergroup.prefs.channels;// デフォルトのチャンネル
      let user_count = usergroup.user_count;// メンバー数
      let date_create = formatTimestamp(usergroup.date_create * 1000); //  作成日（秒単位のタイムスタンプをyyyy/mm/ddの形式に変換する）
      let date_update = formatTimestamp(usergroup.date_update * 1000); //  更新日（秒単位のタイムスタンプをyyyy/mm/ddの形式に変換する）
      let created_by = usergroup.created_by;// 作成者
  
      // 配列にチャンネル情報を格納する
      groupsArr.push([ usergroup_name, handle, usergroup_id, usergroup_team_id, description, usergroup_channels, user_count,
      date_create, date_update, created_by ]);
  
      // usergroup_team_idをteams_nameに置き換える
      for (let i = 0; i < groupsArr.length; i++) {
        for (let j = 0; j < teamsArr.length; j++) {
          if (teamsArr[j][1] === groupsArr[i][3]) {
            groupsArr[i][3] = teamsArr[j][0];
            break;
          }
        }
      }
  
      // created_byとmember_idを照合し、created_byをmember_real_nameに置き換える
      for (let i = 0; i < groupsArr.length; i++) {
        for (let j = 0; j < usersArr.length; j++) {
          if (usersArr[j][1] === groupsArr[i][9]) {
            groupsArr[i][9] = usersArr[j][0];
            break;
          }
        }
      }
  
  
    }
  
    /** スプレッドシートへの書き込み　*/
    const sheet = SHEET_USERGROUPS_LIST;
    sheet.clear();
  
    // 見出しの設定
    sheet.appendRow([ '名前', 'ハンドル', 'ユーザーグループID', 'ワークスペース', '説明', 'デフォルトのチャンネル', 'メンバー数',
    '作成日', '更新日', '作成者']);
  
    // スプレッドシートに書き込み
    try{
      sheet.getRange( sheet.getLastRow()+1,1, groupsArr.length, groupsArr[0].length).setValues(groupsArr);
      }catch(e){
        console.log(e); // エラーログをコンソール上に出力する
      }
    
    //  次のカーソルがある場合getUsergroups関数を呼び出す
    if (JSON.parse(response).response_metadata && JSON.parse(response).response_metadata.next_cursor) {
      getUsergroups(JSON.parse(response).response_metadata.next_cursor);
    }
  }