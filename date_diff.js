function time_between_in_words(from_date, to_date)
{
  return format_milliseconds(Math.abs(from_date.getTime()-to_date.getTime()));
}

function time_ago_in_words(date)
{
  return format_milliseconds(Math.abs(Date.now()-date.getTime()));
}


function format_milliseconds(milsecs)
{
  var one_second = 1000;
  var one_minute = one_second*60;
  var one_hour = one_minute*60;
  var one_day = one_hour*24;
  var one_month = one_day*30;
  var one_year = one_day * 365;

  if (milsecs < one_second)
    return "a moment";
  if (milsecs >= one_second && milsecs < one_minute){
    var value = Math.floor(milsecs/one_second);
    return format_plural(value, value + " second");
  }
  if (milsecs >= one_minute && milsecs < one_hour){
    var value = Math.floor(milsecs/one_minute);
    return format_plural(value, value + " minute");
  }
  if (milsecs >= one_hour && milsecs < one_day){
    var value = Math.floor(milsecs/one_hour);
    return format_plural(value, value + " hour");
  }
  if (milsecs >= one_day && milsecs < one_month){
    var value = Math.floor(milsecs/one_day);
    return format_plural(value, value + " day");
  }
  if (milsecs >= one_month && milsecs < one_year){
    var value = Math.floor(milsecs/one_month);
    return format_plural(value, value + " month");
  }
  if (milsecs >= one_year){
    var value = Math.floor(milsecs/one_year);
    return format_plural(value, value + " year");
  }
}

function format_plural(value, string)
{
  if (value != 1)
    string += "s";
  return string;
}

Date.prototype.time_ago_in_words = function(){
  return time_ago_in_words(this);
};

Date.prototype.time_between_in_words = function(to_date) {
  return time_between_in_words(this, to_date);
};


module.exports.time_between_in_words = time_between_in_words;
module.exports.time_ago_in_words = time_ago_in_words;




