function myFunction() {
  // YouTube DATA API(V3)から検索結果を取得
  var results = YouTube.Search.list('id,snippet', {
    q: 'Google Apps Script',
    type: 'video',
    eventType: 'completed',
    maxResults: 50,
    order: 'date',
    publishedAfter: '2013-01-01T00:00:00Z'
  });
  
  // Sheetに結果を記入
  writeList(results);
  // 統計情報も記入
  writeStatic(results)
 
  // 2ページ目以降の検索結果の取得
  var nextPageToken = results.nextPageToken;
  var query = makeQuery(nextPageToken);
  var resultsNext = YouTube.Search.list('id,snippet', query);
  writeList(resultsNext);
}

// クエリを作成
function makeQuery(nextPageToken){
  var query = {
    q: 'Google Apps Script',
    type: 'video',
    eventType: 'completed',
    maxResults: 50,
    order: 'date',
    publishedAfter: '2013-01-01T00:00:00Z'
  };
   query["pageToken"]= nextPageToken;
  SpreadsheetApp.getActive().getRange("H1").setValue(query);
  return query;
}

// listシートに取得結果を記入
function writeList(results){
  var data = [];
  for(var i = 0; i < results.items.length; i++) {
    Logger.log(results.items[i]);
    var item = results.items[i];
    data.push([item.snippet.title, item.snippet.description, item.snippet.publishedAt, "http://www.youtube.com/watch?v=" + item.id.videoId]);
  }
  var sheet =SpreadsheetApp.getActive().getSheetByName("list")
  var lr = sheet.getLastRow();
 sheet.getRange(lr+1,1,data.length,4).setValues(data);
}

// 統計結果など、蓄積しないデータを記入
function writeStatic(results){
  var id = ['19TFJvOxuSVAIpNnt0Ewi2SG7TszpyrKNfcwKFYLHKtM']
  var ss = SpreadsheetApp.openById(id)
  var staticSheet = ss.getSheetByName("static")
  staticSheet.getRange("B2").setValue(results.pageInfo.totalResults);
  var nextPageToken = results.nextPageToken;
  staticSheet.getRange("C2").setValue(nextPageToken);
  
}


function doGet(e) {
  // listデータをjsonに変換
  payload = JSON.stringify(get_list())
  // payloadをreturnするだけではだめ
  // ContentServiceを利用して、responseを作成
  ContentService.createTextOutput()
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(payload);
  // return response-data
  return output;
}

// 実際にListを作っている
function get_list(){
  var id = ['19TFJvOxuSVAIpNnt0Ewi2SG7TszpyrKNfcwKFYLHKtM']
  var ss = SpreadsheetApp.openById(id)
  var sheet = ss.getSheetByName("list")
  var values = sheet.getRange(1, 1, sheet.getLastRow(), 2).getValues()
  const LastRow = values.length;

  var res = {}
  res["v"] = "v1";
  var childArray = []
  for(var i=1; i<LastRow; i++){
    var childRes = {}
    childRes[values[0][0]] = values[i][0]
    childRes[values[0][1]] = values[i][1]
    childArray.push(childRes)
  }
  res["list"] = childArray
  Logger.log(res)
//  sheet.getRange(5, 5).setValue(res)
  return res  
}