
var mapData
function getJsonCallback(data) {
    mapData = data
}
function keyVal(key, props) {
    result = ""
    if (props[key]) {
        result = "<br><b>" + key + ":</b>" + props[key]
    }
    return result
}
function locationHtml(props) {
    result = "<b>" + props["Address"] + "</b>"
    if (props["Photo ::image"]) {
        result += "<br><img src=\"" + props["Photo ::image"] +
            "\">"
    }
    result += keyVal("Date", props)
    result += keyVal("Style", props)
    result += keyVal("Architect", props)
    result += keyVal("Builder", props)

    if (props["Notes"]) {
        result += "<p>" + props["Notes"] + "</p>"
    }
    return result
}
/* Create all the markers, bind their popups and render them.
   This stores them in the marker property and subsequent operations
   can remove or re-add them to the map.
*/
function populateMarkers(mymap) {
    var count = 0
    for (loc of mapData["locations"]) {
        loc["marker"] = L.circleMarker([loc["latitude"], loc["longitude"]], { "radius": 3 })
            .addTo(mymap)
            .bindPopup(locationHtml(loc["properties"]))
        count++
    }
    displaySearchCount(count)
}
function clearMarkers(mymap) {
    for (loc of mapData["locations"]) {
        loc["marker"].remove()
    }
}
function reset(mymap) {
    // TODO: clear the search boxes and the toggles
    $('#address').val('')
    $('#keywords').val('')
    $(':checkbox').prop('checked', false)
    var count = 0
    for (loc of mapData["locations"]) {
        loc["marker"].addTo(mymap)
        count++
    }
    displaySearchCount(count)
}
function displaySearchCount(count) {
    $("#result_box").fadeOut(function () {
        $("#result_count").html(count + " matches found");
    });
    $("#result_box").fadeIn();
}
function makeKeywordList(keywords) {
    var kwlist = []
    if (keywords != '')
        kwlist = keywords.split(' ')
    for (kid of $("#explore").children()) {
        var f = kid.firstChild.firstChild
        if (f.checked) {
            kwlist.push(f.id)
        }
    }
    return kwlist
}
/* Search for any items that match the criteria.
   The address is just taken as a string to be matched exactly. 
   The keywords are expected to be a list.
   The search succeeds if the address matches AND any of the keywords
   match. If either the address or the keywords are empty, then
   they trivially match.
*/
function doSearch(mymap) {
    const address = $('#address').val()
    const keywords = $('#keywords').val()
    clearMarkers(mymap)
    var matchCount = 0
    kwlist = makeKeywordList(keywords)
    if (kwlist.length > 0) {
        var kregex = new RegExp('(' + kwlist.join('|') + ')', "i")
    }
    var aregex = new RegExp(address, "i")
    for (loc of mapData["locations"]) {
        match = false
        if (kwlist.length > 0) {
            var note = loc["properties"]["Concatenation"]
            if (note) {
                if (kregex.test(note)) {
                    match = true
                }
            }
        }
        if (!match && kwlist.length > 0)
            continue
        if (address != "") {
            var addr = loc["properties"]["Address"]
            if (addr) {
                if (aregex.test(addr)) {
                    match = true
                }
            }
        }
        if (match) {
            loc["marker"].addTo(mymap)
            matchCount++
        }
    }
    displaySearchCount(matchCount)
}
function testScalability(mymap) {
    var x;
    var y;
    x = 42.4595;
    y = -76.4866;
    var i;
    var j;
    for (i = 0; i < 33; i++) {
        for (j = 0; j < 33; j++) {
            markers.push(L.circleMarker([x, y], { 'radius': 2 }).addTo(mymap))
            x += 0.001;
        }
        x = 42.4595;
        y += 0.001;
    }
}
function mapMain() {
    var mymap = L.map('mapid').setView([42.4595, -76.4866], 14);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
    }).addTo(mymap);
    populateMarkers(mymap)
    $('#search0').click(function () {
        doSearch(mymap)
    })
    $('#reset0').click(function () {
        reset(mymap)
    })
    $(':checkbox').click(function () {
        doSearch(mymap);
    });
    $(":text").keydown(function (e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (key === 13) {
            $('#search0').click();
            return false;
        }
    })
}