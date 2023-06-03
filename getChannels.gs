/** チャンネルの取得　*/
function getChannels(cursor) {

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
  
    /** SlackAPI呼び出し */
    params.payload.cursor = cursor;
    params.payload.types = "public_channel, private_channel";
    url = CONVERSATIONS_LIST;
    response = callApi(url, params);
    channels = JSON.parse(response.getContentText()).channels;
    
    for (const channel of channels) {
      let channel_name = channel.name; // チャンネル名
      let channel_team_id = channel.context_team_id; // ワークスペースID
      let channel_creator = channel.creator; // 作成者
      let channel_created = formatTimestamp(channel.created * 1000); // 作成日（秒単位のタイムスタンプをyyyy/mm/ddの形式に変換する）
      let channel_messages_ts = ""; // 最終更新日（ミリ秒単位のタイムスタンプをyyyy/mm/ddの形式に変換する）
      let channel_num_members = channel.num_members; // メンバー数
      let is_private = channel.is_private; // プライベートチャンネル
      let is_ext_shared = channel.is_ext_shared; // Slackコネクトチャンネル
      let is_archived = channel.is_archived; // チャンネルの状態
  
      /** SlackAPI呼び出し */
      // メッセージが最後に投稿された日（channel_messages_ts)を取得する
      url = CONVERSATIONS_HISTORY;
      params.payload.channel = channel.id;  // チャンネルIDを指定
      params.payload.limit = 1;
      response = callApi(url, params);
      const messages = JSON.parse(response.getContentText()).messages;
      const lastMessage = messages[0];
      channel_messages_ts = formatTimestamp(lastMessage.ts * 1000);
  
      // channel_messages_tsが3ヶ月以上前の場合のみ、チャンネル情報を格納する
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 現在時刻から1日前の日時（ミリ秒）を取得
      const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000); // 現在時刻から3ヶ月前の日時（ミリ秒）を取得
      const lastMessageDate = new Date(channel_messages_ts); // channel_messages_tsをDateオブジェクトに変換
  
      // アクティブなチャンネル情報を格納する
      if((lastMessageDate < oneDayAgo) && !is_archived){
        channelsArr.push([ channel_team_id, channel_creator, channel_name, channel_created, channel_messages_ts, channel_num_members, is_private, is_ext_shared ]);
      }
  
      // channel_team_idをteams_nameに置き換える
      for (let i = 0; i < channelsArr.length; i++) {
        for (let j = 0; j < teamsArr.length; j++) {
          if (teamsArr[j][1] === channelsArr[i][0]) {
            channelsArr[i][0] = teamsArr[j][0];
            break;
          }
        }
      }
  
      // channel_creatorとmember_idを照合し、channel_creatorをmember_real_nameに置き換える
      for (let i = 0; i < channelsArr.length; i++) {
        for (let j = 0; j < usersArr.length; j++) {
          if (usersArr[j][1] === channelsArr[i][1]) {
            channelsArr[i][1] = usersArr[j][0];
            break;
          }
        }
      }
      
    }
  
    /** スプレッドシートへの書き込み */
    const sheet = SHEET_CHANNELS_LIST;
    sheet.clear();
  
    // 見出しの設定
    sheet.appendRow([ 'ワークスペース', '作成者', 'チャンネル名', '作成日', 'メッセージが最後に投稿された日', 'メンバー数', 'プライベートチャンネル', 'Slackコネクトチャンネル' ]);
  
    // 書き込み
    try {
      if (channelsArr.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, channelsArr.length, channelsArr[0].length).setValues(channelsArr); 
      }
    }catch(e){
      console.log(e); // エラーログをコンソール上に出力する
    }
  
    //  次のデータがある場合getChannels関数を呼び出す
    if (JSON.parse(response).response_metadata && JSON.parse(response).response_metadata.next_cursor) {
      getChannels(JSON.parse(response).response_metadata.next_cursor);
    }
  }