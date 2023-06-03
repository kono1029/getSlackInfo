/** ワークスペースの取得　*/
function getWorkspaces(cursor) {
    /** SlackAPI呼び出し */
    params.payload.cursor = cursor;
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
  
    /** スプレッドシートへの書き込み　*/
    const sheet = SHEET_WORKSPACES;
    sheet.clear();
  
    // 見出しの設定
    sheet.appendRow([ 'ワークスペース名', 'ワークスペースID' ]);
  
    // スプレッドシートに書き込み
    try{
      sheet.getRange( sheet.getLastRow()+1,1, teamsArr.length, teamsArr[0].length).setValues(teamsArr);
      }catch(e){
        console.log(e); // エラーログをコンソール上に出力する
      }
    
    //  次のカーソルがある場合getWorkspaces関数を呼び出す
    if (JSON.parse(response).response_metadata && JSON.parse(response).response_metadata.next_cursor) {
      getWorkspaces(JSON.parse(response).response_metadata.next_cursor);
    }
  }