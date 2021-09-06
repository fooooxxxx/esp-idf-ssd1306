var gpharray7 = [];
var gphgridofs7 = 8;

var ClearGraph = function (dst) {
    var canvas = document.getElementById(dst);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
};

var DrawGraph = function (dst, grapharray, gridoffset, gtype, step, thick, griddensity, minval, maxval, autoscale, bo_100, showbg, bgcolor, showframe, framecolor, showgrid, gridcolor, graphcolor, showscale, fontfamily, fontcolor, fontsize, fontstyle, fontvariant, fontweight, rightalign) {
    var canvas = document.getElementById(dst);
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    var x1 = 0;
    var y1 = 0;
    var x2 = W - 1;
    var y2 = H - 1;
    var gtype_ag = (gtype == "AG");
    var gtype_hg = (gtype == "HG");
    ctx.clearRect(0, 0, W, H);
    if (showframe) {
        x1++;
        y1++;
        x2--;
        y2--;
        W = W - 2;
        H = H - 2;
    }
    var r_minval;
    var r_maxval;
    var i_graph_width_half = (W / 2) + 1;
    if (autoscale) {
        r_minval = +1e9;
        r_maxval = -1e9;
        var i_minval;
        var i_maxval;
        var value_x = x2;
        var bo_break = false;
        for (i = 0; i < i_graph_width_half; i++)
            if (i < grapharray.length) {
                if (grapharray[i] < r_minval) r_minval = grapharray[i];
                if (grapharray[i] > r_maxval) r_maxval = grapharray[i];
                if (bo_break) break;
                if (gtype_hg) {
                    value_x -= (thick + step);
                    if (value_x < x1) break;
                }
                else {
                    value_x -= (step + 1);
                    if (value_x < x1) bo_break = true;
                }
            }
        if (r_minval == +1e9) r_minval = 0;
        if (r_maxval == -1e9) r_maxval = 0;
        if (bo_100) {
            i_minval = Math.round(r_minval * 0.009) * 100;
            i_maxval = Math.round(r_maxval * 0.011) * 100;
            if (i_minval > r_minval) i_minval = Math.floor(r_minval) * 100;
            while (i_maxval <= i_minval) i_maxval = i_maxval + 100;
        }
        else {
            i_minval = Math.round(r_minval * 0.9);
            i_maxval = Math.round(r_maxval * 1.1);
            if (i_minval > r_minval) i_minval = Math.floor(r_minval);
            if (i_maxval < r_maxval) i_maxval++;
            while (i_maxval <= i_minval) i_maxval += 2;
        }
        r_minval = i_minval;
        r_maxval = i_maxval;
    }
    else {
        r_minval = minval;
        r_maxval = maxval;
    }
    if (showbg) {
        ctx.fillStyle = bgcolor;
        ctx.fillRect(x1, y1, W, H);
    }
    if (showgrid) {
        ctx.fillStyle = gridcolor;
        if (!gtype_hg)
            for (i = 0; i < W; i++)
                if ((i % griddensity) == gridoffset) ctx.fillRect(x1 + i, y1, 1, y2 - y1 + 1)
        for (i = H - 1; i >= 0; i--)
            if ((i % griddensity) == 0)
                if ((!showframe) || (i)) ctx.fillRect(x1, y2 - i, x2 - x1 + 1, 1)
    }
    var val_range = r_maxval - r_minval;
    var value_x = x2;
    if (gtype_hg) {
        ctx.fillStyle = graphcolor;
        for (i = 0; i < i_graph_width_half; i++)
            if (i < grapharray.length) {
                var value_y = y2 - Math.floor((grapharray[i] - r_minval) / val_range * H);
                ctx.fillRect(value_x - (thick - 1), value_y, thick, y2 - value_y + 1);
                value_x -= (thick + step);
                if (value_x < x1) break;
            }
    }
    else {
        var bo_first = true;
        var bo_break = false;
        var first_y = y2;
        var prev_x = value_x;
        for (i = 0; i < i_graph_width_half; i++)
            if (i < grapharray.length) {
                var value_y = y2 - Math.floor((grapharray[i] - r_minval) / val_range * H);
                if (bo_first) {
                    ctx.fillStyle = graphcolor;
                    ctx.fillRect(value_x, value_y, 1, 1);
                    bo_first = false;
                    first_y = value_y;
                    ctx.strokeStyle = graphcolor;
                    ctx.lineWidth = thick;
                    ctx.beginPath();
                    ctx.moveTo(value_x, value_y);
                }
                else ctx.lineTo(value_x, value_y);
                prev_x = value_x;
                if (bo_break) break;
                value_x -= (step + 1);
                if (value_x < x1) bo_break = true;
            }
        if (!bo_first) {
            ctx.stroke();
            if (gtype_ag) {
                ctx.save();
                if (value_x < x1) ctx.lineTo(x1, y2 + 1);
                else ctx.lineTo(prev_x, y2 + 1);
                ctx.lineTo(x2 + 1, y2 + 1);
                ctx.lineTo(x2 + 1, first_y);
                ctx.clip();
                ctx.fillStyle = graphcolor;
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = 0.33;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }
        }
    }
    if (showscale) {
        ctx.fillStyle = fontcolor;
        ctx.font = fontstyle + " " + fontvariant + " " + fontweight + " " + fontsize + " " + fontfamily;
        if (rightalign) {
            ctx.textBaseline = "alphabetic";
            ctx.fillText(r_minval, x2 - ctx.measureText(r_minval).width, y2);
            ctx.textBaseline = "hanging";
            ctx.fillText(r_maxval, x2 - ctx.measureText(r_maxval).width, y1 + 1);
        }
        else {
            ctx.textBaseline = "alphabetic";
            ctx.fillText(r_minval, x1 + 1, y2);
            ctx.textBaseline = "hanging";
            ctx.fillText(r_maxval, x1 + 1, y1 + 1);
        }
    }
    if (showframe) {
        ctx.fillStyle = framecolor;
        ctx.fillRect(0, 0, 1, canvas.height);
        ctx.fillRect(0, canvas.height - 1, canvas.width, 1);
        ctx.fillRect(canvas.width - 1, 0, 1, canvas.height - 1);
        ctx.fillRect(0, 0, canvas.width, 1);
    }
};
var DrawArcGauge = function (dst, thickness, startangle, perc, bgcolor, color, fill, fillcolor, showtext, text, fontfamily, fontcolor, fontsize, fontstyle, fontvariant, fontweight) {
    var canvas = document.getElementById(dst);
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    var startradians = startangle * Math.PI / 180;
    var endradians = (startangle + 360 * perc / 100) * Math.PI / 180;
    ctx.clearRect(0, 0, W, H);
    if (text == "") return;
    if (fill) {
        ctx.beginPath();
        ctx.strokeStyle = fillcolor;
        ctx.lineWidth = thickness / 2;
        ctx.arc(W / 2, H / 2, (W - thickness * 1.5) / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = fillcolor;
        ctx.fill();
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.strokeStyle = bgcolor;
    ctx.lineWidth = thickness;
    if (perc == 0) ctx.arc(W / 2, H / 2, (W - thickness) / 2, 0, Math.PI * 2, false);
    else ctx.arc(W / 2, H / 2, (W - thickness) / 2, endradians - Math.PI / 2, startradians - Math.PI / 2, false);
    ctx.stroke();
    if (perc > 0) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.arc(W / 2, H / 2, (W - thickness) / 2, startradians - Math.PI / 2, endradians - Math.PI / 2, false);
        ctx.stroke();
    }
    if (showtext) {
        ctx.fillStyle = fontcolor;
        ctx.font = fontstyle + " " + fontvariant + " " + fontweight + " " + fontsize + " " + fontfamily;
        ctx.textBaseline = "middle";
        ctx.fillText(text, W / 2 - ctx.measureText(text).width / 2, H / 2);
    }
};

var bo_webkit = navigator.userAgent.toLowerCase().indexOf("webkit") > -1;
var s_webkit = "";
var s_barp = "";

(function (global) {
    if ("EventSource" in global) return;
    var reTrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
    var EventSource = function (url) {
        var eventsource = this, interval = 500, lastEventId = null, cache = "";
        if (!url || typeof url != "string") {
            throw new SyntaxError("Not enough arguments");
        }
        this.URL = url;
        this.readyState = this.CONNECTING;
        this._pollTimer = null;
        this._xhr = null;
        function pollAgain(interval) {
            eventsource._pollTimer = setTimeout(function () {
                poll.call(eventsource);
            }, interval);
        }
        function poll() {
            try {
                if (eventsource.readyState == eventsource.CLOSED) return;
                var xhr = new XMLHttpRequest(); xhr.open("GET", eventsource.URL, true);
                xhr.setRequestHeader("Accept", "text/event-stream");
                xhr.setRequestHeader("Cache-Control", ":no-cache");
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                if (lastEventId != null) xhr.setRequestHeader("Last-Event-ID", lastEventId);
                cache = "";
                xhr.timeout = 50000;
                xhr.onreadystatechange = function () {
                    if (this.readyState == 3 || (this.readyState == 4 && this.status == 200)) {
                        if (eventsource.readyState == eventsource.CONNECTING) {
                            eventsource.readyState = eventsource.OPEN;
                            eventsource.dispatchEvent("open", { type: "open" });
                        }
                        var responseText = "";
                        try {
                            responseText = this.responseText || "";
                        } catch (e) {

                        }
                        var parts = responseText.substr(cache.length).split("\n"), eventType = "message", data = [], i = 0, line = "";
                        cache = responseText;
                        for (; i < parts.length; i++) {
                            line = parts[i].replace(reTrim, "");
                            if (line.indexOf("event") == 0) {
                                eventType = line.replace(/event:?\s*/, "");
                            }
                            else if (line.indexOf("retry") == 0) {
                                retry = parseInt(line.replace(/retry:?\s*/, ""));
                                if (!isNaN(retry)) {
                                    interval = retry;
                                }
                            }
                            else if (line.indexOf("data") == 0) {
                                data.push(line.replace(/data:?\s*/, ""));
                            }
                            else if (line.indexOf("id:") == 0) {
                                lastEventId = line.replace(/id:?\s*/, "");
                            }
                            else if (line.indexOf("id") == 0) { lastEventId = null; }
                            else if (line == "") {
                                if (data.length) {
                                    var event = new MessageEvent(data.join("\n"), eventsource.url, lastEventId);
                                    eventsource.dispatchEvent(eventType, event);
                                    data = [];
                                    eventType = "message";
                                }
                            }
                        }
                        if (this.readyState == 4) pollAgain(interval);
                    } else if (eventsource.readyState !== eventsource.CLOSED) {
                        if (this.readyState == 4) {
                            eventsource.readyState = eventsource.CONNECTING;
                            eventsource.dispatchEvent("error", { type: "error" });
                            pollAgain(interval);
                        }
                        else if (this.readyState == 0) {
                            pollAgain(interval);
                        } else { }
                    }
                };
                xhr.send();
                setTimeout(function () {
                    if (true || xhr.readyState == 3) xhr.abort();
                }, xhr.timeout);
                eventsource._xhr = xhr;
            } catch (e) {
                eventsource.dispatchEvent("error", { type: "error", data: e.message });
            }
        }; poll();
    };
    EventSource.prototype = {
        close: function () {
            this.readyState = this.CLOSED;
            clearInterval(this._pollTimer); this._xhr.abort();
        },
        CONNECTING: 0,
        OPEN: 1,
        CLOSED: 2,
        dispatchEvent: function (type, event) {
            var handlers = this["_" + type + "Handlers"];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i].call(this, event);
                }
            } if (this["on" + type]) {
                this["on" + type].call(this, event);
            }
        },
        addEventListener: function (type, handler) {
            if (!this["_" + type + "Handlers"]) {
                this["_" + type + "Handlers"] = [];
            }
            this["_" + type + "Handlers"].push(handler);
        },
        removeEventListener: function (type, handler) {
            var handlers = this["_" + type + "Handlers"];
            if (!handlers) {
                return;
            }
            for (var i = handlers.length - 1; i >= 0; --i) {
                if (handlers[i] === handler) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        },
        onerror: null,
        onmessage: null,
        onopen: null,
        readyState: 0,
        URL: ""
    };
    var MessageEvent = function (data, origin, lastEventId) {
        this.data = data;
        this.origin = origin;
        this.lastEventId = lastEventId || "";
    };
    MessageEvent.prototype = { data: null, type: "message", lastEventId: "", origin: "" };
    if ("module" in global)
        module.exports = EventSource; global.EventSource = EventSource;
})(this);
var source = new EventSource("/sse");
source.onmessage = function (event) {
    var s_data = event.data;
    var s_item;
    var s_items;
    var i_idx;
    if (s_data.substr(0, 6) == "ReLoad") setTimeout(function () { window.location.reload(); }, 500);
    while (s_data.indexOf("{|}") > -1) {
        i_idx = s_data.indexOf("{|}");
        s_item = s_data.substr(0, i_idx);

        if (s_item.indexOf("Bar") == 0) {
            s_items = s_item.split("|", 4);

        }
        else
            if (s_item.indexOf("Gph") == 0) {
                s_items = s_item.split("|", 3);
                if (s_items[0] == "Gph7p") {
                    if (s_items[1] == "") ClearGraph("Gph7");
                    else {
                        if (isNaN(s_items[1])) gpharray7.splice(0, 0, 0);
                        else gpharray7.splice(0, 0, parseFloat(s_items[1]));
                        if (gpharray7.length > 51) gpharray7.pop();
                        DrawGraph("Gph7", gpharray7, gphgridofs7, "LG", 1, 1, 10, 0, 100, 0, 0, 1, "#000000", 1, "#666666", 1, "#008000", "#FFFF00", 1, "Tahoma", "#FFFFFF", "10pt", "normal", "normal", "normal", 0);
                        gphgridofs7 -= 2;
                        if (gphgridofs7 < 0) gphgridofs7 = 10 + gphgridofs7;
                        if (gphgridofs7 < 0) gphgridofs7 = 8;
                    }
                }

            }
            else
                if (s_item.indexOf("Arc") == 0) {
                    s_items = s_item.split("|", 5);

                }
                else {
                    s_items = s_item.split("|", 2);

                    if (s_items[0] == "Simple1") document.getElementById("Simple1").innerHTML = s_items[1];
                    if (s_items[0] == "Simple2") document.getElementById("Simple2").innerHTML = s_items[1];
                    if (s_items[0] == "Simple3") document.getElementById("Simple3").innerHTML = s_items[1];
                    if (s_items[0] == "Simple4") document.getElementById("Simple4").innerHTML = s_items[1];
                    if (s_items[0] == "Simple5") document.getElementById("Simple5").innerHTML = s_items[1];
                    if (s_items[0] == "Simple6") document.getElementById("Simple6").innerHTML = s_items[1];

                }
        s_data = s_data.substr(i_idx + 3);
    }
};