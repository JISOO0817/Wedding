// 시트 컬럼 순서: [id, time, name, message, password]
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const data = rows
    .filter(r => r[0] && r[2] && r[3])
    .map(r => ({
      id: r[0],
      time: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      name: r[2],
      message: r[3]
    }));
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const action = e.parameter.action || 'add';

  if (action === 'delete') {
    const id = e.parameter.id;
    const password = e.parameter.password;
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (String(data[i][4]) !== String(password)) {
          return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: '비밀번호가 일치하지 않습니다.' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: '글을 찾을 수 없습니다.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const id = Utilities.getUuid();
  const name = e.parameter.name || '';
  const message = e.parameter.message || '';
  const password = e.parameter.password || '';
  sheet.appendRow([id, new Date(), name, message, password]);
  return ContentService.createTextOutput(JSON.stringify({ result: 'success', id: id }))
    .setMimeType(ContentService.MimeType.JSON);
}
