function logUsage(message, additionalInfo) {
  var logEntry = getJsLoggingInfo(message, additionalInfo);
  $.ajax({
    method: "POST",
    url: "http://localhost:54739/logging/Usage",
    contentType: "application/json",
    data: JSON.stringify(logEntry)
  });
}

function logDiagnostic(message, additionalInfo) {
  var logEntry = getJsLoggingInfo(message, additionalInfo);
  $.ajax({
    method: "POST",
    url: "http://localhost:54739/logging/Diagnostic",
    contentType: "application/json",
    data: JSON.stringify(logEntry)
  });
}

function logError(message, responseMessage, additionalInfo) {
  var logEntry = getJsLoggingInfo(message, additionalInfo);
  var correlation = responseMessage.replace(/.*error id: /gi, "");
  logEntry.CorrelationId = correlation;
  $.ajax({ method: "POST",
    url: "http://localhost:54739/logging/Error",
    contentType: "application/json",
    data: JSON.stringify(logEntry)
  });
}

function perfLoggerStart(message, additionalInfo) {
  // btoa just does base64 encoding
  // add numeric date value? must return value to caller for lookup in stop
  var sessionKey = btoa(message);
  sessionStorage[sessionKey] =
        JSON.stringify(getJsLoggingInfo(message, additionalInfo));
}

function perfLoggerStop(message) {
  var sessionKey = btoa(message);
  var now = new Date();
  var logEntry = JSON.parse(sessionStorage[sessionKey]);
  logEntry.ElapasedMilliseconds = now - Date.parse(logEntry.Timestamp);

  $.ajax({
    method: "POST",
    url: "http://localhost:54739/logging/Performance",
    contentType: "application/json",
    data: JSON.stringify(logEntry)
  });
}

function getJsLoggingInfo(message, additionalInfo) {
  var logInfo = {};
  logInfo.Timestamp = new Date;
  logInfo.Location = window.location.toString();
  logInfo.Product = "ToDos";
  logInfo.Layer = "ClientJS";
  logInfo.Message = message;
  logInfo.HostName = ""; // get ip Addressif you want to somehow

  // use hidden fields or sessionStorage or similar to get these values from the server side
  logInfo.UserId = ""; // http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier claim from User.Identity.Claims
  logInfo.UserName = ""; // User.Identity.Name form server side
  
  logInfo.AdditionalInfo = {};
  if (additionalInfo) {
    for (var property in additionalInfo) {
      if (additionalInfo.hasOwnProperty(property)) {
        logInfo.AdditionalInfo[property] = additionalInfo[property];
      }
    }
  }

  return logInfo;
}