/** ユーザーの取得 */
function getUsers(cursor) {
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
      
      params.payload.cursor = cursor; 
      url = USERS_LIST;
      response = callApi(url, params);
      members = JSON.parse(response).members;
  
      for (const member of members) {
        let member_email = member.profile.email; // メールアドレス
        let member_name = member.name; // ユーザー名
        let member_real_name = member.profile.real_name; // 氏名
        let member_id = member.id; // ユーザーID
        let member_team_id = member.team_id; // ワークスペース
        let is_primary_owner = member.is_primary_owner; // プライマリオーナーの判定
        let is_owner = member.is_owner; // ワークスペースオーナーの判定
        let is_admin  = member.is_admin; // ワークスペース管理者の判定
        let is_restricted = member.is_restricted; // Trueならばゲスト
        let is_ultra_restricted = member.is_ultra_restricted; // Trueならばシングルチャンネルゲスト　、Falseかつis_restrictedがTrueならばマルチチャンネルゲスト
        let is_invited_user = member.is_invited_user;//  招待中か判定
        let is_bot = member.is_bot; // botユーザーの判定
        let is_app_user = member.is_app_user; //  アプリユーザーの判定
        let deleted = member.deleted; // アカウントの状態の判定
  
        let primary_owner; // プライマリオーナー
        let owner; // ワークスペースオーナー
        let admin; // ワークスペース管理者
        let status; // アカウントの状態
  
        if(is_primary_owner){
          primary_owner = "プライマリオーナー";
        }else if(is_owner){
          owner = "オーナー";
        }else if(is_admin){
          admin = "管理者";
        }
  
        if(is_invited_user){
          status = "招待中"
        }else{
          status = "アクティブ";
        }
  
        // アクティブなメンバーのみリストに追加する
        if(!is_ultra_restricted && !is_restricted && !deleted && !is_bot && !is_app_user){
          usersArr.push([ member_email, member_name, member_real_name, member_id, member_team_id, primary_owner, owner, admin, status ]);
        }
  
        // member_team_idをteams_nameに置き換える
        for (let i = 0; i < usersArr.length; i++) {
          for (let j = 0; j < teamsArr.length; j++) {
            if (teamsArr[j][1] === usersArr[i][4]) {
              usersArr[i][4] = teamsArr[j][0];
              break;
            }
          }
        }
      }
   
    /** スプレッドシートへの書き込み　*/
    const sheet = SHEET_USERS_LIST;
    sheet.clear();
  
    // 見出しの設定
    sheet.appendRow([ 'メールアドレス', 'ユーザー名', '氏名', 'ユーザーID', 'ワークスペース', 'プライマリオーナー', 'オーナー', '管理者', 'アカウントの状態' ]);
  
    // スプレッドシートに書き込み
    try{
      sheet.getRange( sheet.getLastRow()+1,1, usersArr.length, usersArr[0].length).setValues(usersArr);
      }catch(e){
        console.log(e); // エラーログをコンソール上に出力する
      }
    
    //  次のカーソルがある場合getUsers関数を呼び出す
    if (JSON.parse(response).response_metadata && JSON.parse(response).response_metadata.next_cursor) {
      getUsers(JSON.parse(response).response_metadata.next_cursor);
    }
  }