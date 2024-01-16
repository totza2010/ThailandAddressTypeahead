/**
* @name ThailandAddressTypeahead
* @version 1.0.0
* @update Jan 16, 2024
* @website https://github.com/totza2010/ThailandAddressTypeahead
* @license WTFPL v.2 - http://www.wtfpl.net/
*
* @dependencies: jQuery <https://jquery.com/>
*                typeahead.js <https://github.com/corejavascript/typeahead.js>
**/
class ThailandAddress {
    constructor() {
        this.db = [];
    }

    loadData = (data) => {
        // Assume data format is already in the provided structure
        this.db = data;
        console.log("Loaded Data:", this.db);
        return this;
    };

    buildQueryInstance = () => new Query(this.mapStrings());

    mapStrings = () => {
        let resultArray = this.db.flatMap(province => 
            province.amphure.flatMap(amphure => 
                amphure.tambon.map(tambon => ({
                    'tambon_id': tambon.id,
                    'tambon_th': tambon.name_th,
                    'tambon_en': tambon.name_en,
                    'amphure_id': amphure.id,
                    'amphure_th': amphure.name_th,
                    'amphure_en': amphure.name_en,
                    'province_id': province.id,
                    'province_th': province.name_th,
                    'province_en': province.name_en,
                    'zipcode': tambon.zip_code
                }))
            )
        );

        console.log("Mapped Strings:", resultArray);
        return resultArray;
    };

    execute = () => {
        const queryInstance = this.buildQueryInstance();
        $.Address.DB = queryInstance;
        console.log("Query Instance:", queryInstance);
        return queryInstance;
    };
}

$.Address = e => {
    "use strict";
    e = $.extend({}, $.Address.defaults, e);

    const stringSimilarity = (str1, str2, isPercentage) => {
        str1 = str1.toString();
        str2 = str2.toString();
        let maxLength = 0,
            startIndex1 = 0,
            startIndex2 = 0,
            commonLength = 0;

        for (let i = 0; i < str1.length; i++) {
            for (let j = 0; str2.length > j; j++) {
                let k = 0;
                while (i + k < str1.length && j + k < str2.length && str1.charAt(i + k) === str2.charAt(j + k)) {
                    k++;
                }

                if (k > commonLength) {
                    commonLength = k;
                    startIndex1 = i;
                    startIndex2 = j;
                }
            }
        }

        maxLength = Math.max(str1.length, str2.length);
        const similarity = commonLength ? commonLength / maxLength : 0;

        return isPercentage ? Math.floor(similarity * 100) : similarity;
    };

    !function (a) {
        const addressDB = new ThailandAddress();
        $.getJSON(e.database)
            .done((response) => {
                a(addressDB.loadData(response).execute());
            })
            .fail((error) => {
                console.error(`Error loading data from "${e.database}":`, error);
                throw new Error(`File "${e.database}" does not exist.`);
            });
    }(t => {
        $.Address.DB = t;
        let n, i, o = {
            empty: " ",
            suggestion: entry => {
                let tambon = entry[`tambon_${e.lang}`];
                let amphure = entry[`amphure_${e.lang}`];
                let province = entry[`province_${e.lang}`];
                let zipcode = entry.zipcode;
                return `<div>${tambon} » ${amphure} » ${province} » ${zipcode}</div>`;
            },
        };
        
        for (let n in e) {
            if (n.includes("$") && "$search" !== n && e.hasOwnProperty(n) && e[n] && e[n].typeahead) {
                e[n].typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1,
                }, {
                    limit: e.autocomplete_size,
                    templates: o,
                    source: function (query, callback) {
                        let results = [];
                        let field = this.$el.data("field");
                        try {
                            results = t.select("*").where(field).match(`^${query}`).orderBy(field).fetch();
                        } catch (error) {}
                        callback(results);
                    },
                    display: function(item) {
                        // Ensure 'item' has the expected properties
                        return item && item[this.$el.data("field")] || '';
                    },
                }).parent().find(".tt-dataset").data("field", n.replace("$", ""));
            }
        }
        
        e.$search && e.$search.typeahead({
            hint: !0,
            highlight: !0,
            minLength: 2,
        }, {
            limit: e.autocomplete_size,
            templates: o,
            source: function (query, callback) {
                let results = [];
                try {
                    results = [
                        ...t.select("*").where("zipcode").match(query).fetch(),
                        ...t.select("*").where(`province_${e.lang}`).match(query).fetch(),
                        ...t.select("*").where(`amphure_${e.lang}`).match(query).fetch(),
                        ...t.select("*").where(`tambon_${e.lang}`).match(query).fetch(),
                    ]
                        .map(entry => JSON.stringify(entry))
                        .filter((entry, index, self) => self.indexOf(entry) === index)
                        .map(entry => {
                            entry = JSON.parse(entry);
                            entry.likely = [
                                5 * stringSimilarity(query, entry[`tambon_${e.lang}`]),
                                3 * stringSimilarity(query, entry[`amphure_${e.lang}`].replace(/^เมือง/, "")),
                                stringSimilarity(query, entry[`province_${e.lang}`]),
                                stringSimilarity(query, entry.zipcode),
                            ].reduce((max, value) => Math.max(max, value), 0);
                            return entry;
                        })
                        .sort((a, b) => b.likely - a.likely);
                } catch (error) {}
                callback(results);
            },
            display: () => "",
        });
        for (n in e) n.includes("$") && e.hasOwnProperty(n) && e[n] && e[n].bind("typeahead:select typeahead:autocomplete", function (t, a) {
            for (n in e) i = n.replace("$", ""), n.includes("$") && e.hasOwnProperty(n) && e[n] && a[i] && e[n].typeahead("val", a[i]).trigger("change");
            "function" == typeof e.onDataFill && (delete a.likely, e.onDataFill(a));
        }).blur(function () {
            this.value || $(this).parent().find(".tt-dataset").html("");
        });

        "function" == typeof e.onLoad && e.onLoad();
        "function" == typeof e.onComplete && e.onComplete();
    });
}, $.Address.defaults = {
    database: "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json",
    autocomplete_size: 20,
    onLoad: function() {},
    onDataFill: function() {},
    $tambon_th: !1,
    $tambon_en: !1,
    $tambon_id: !1,
    $amphure_th: !1,
    $amphure_en: !1,
    $amphure_id: !1,
    $province_th: !1,
    $province_en: !1,
    $province_id: !1,
    $zipcode: !1,
    $search: !1,
    lang: "en"
}, $.Address.setup = e => $.extend($.Address.defaults, e);

class Query {
    constructor(t) {
        if (typeof t === 'string') {
            t = JSON.parse(t);
        }
        this.data_source = t;
        this.buffer = t;
        this.focused_field = "";
        this.options = [];
        this.size = false;

        for (let i in t) {
            for (let s in t[i]) {
                this.options.push(s);
            }
            break;
        }
    }

    fetch = () => {
        if ("object" == typeof this.options) {
            let t = {};
            for (let i in this.buffer) {
                t[i] = {};
                for (let s in this.options) {
                    let r = this.options[s];
                    this.buffer[i][r] && (t[i][r] = this.buffer[i][r]);
                }
            }
            this.buffer = t;
        }

        if (this.size) {
            let t = this.size.toString().split(","),
                s = 0,
                r = this.size;

            if (t.length > 1 && t[0] < t[1]) {
                s = parseInt(t[0]);
                r = s + parseInt(t[1]);
            }

            let f = {};
            for (let i = s; r > i && this.buffer[i]; i++) f[i] = this.buffer[i];
            this.buffer = f;
        }

        return this.buffer;
    }

    new = (t) => {
        this.data_source = t;
        this.buffer = t;
    }

    limit = (t) => {
        return this.size = t, this;
    }

    select = (t) => {
        this.options = t;
        "string" == typeof t && "*" !== t && (this.options = t.split(","));
        this.buffer = this.data_source;
        this.size = false;
        return this;
    }

    where = (t) => {
        this.focused_field = t;
        return this;
    }

    contains = (t, i) => {
        let s = this.buffer;
        this.buffer = [];
        for (let r in s) i ? ~s[r][this.focused_field].indexOf(t) && this.buffer.push(s[r]) : ~s[r][this.focused_field].toLowerCase().indexOf(t.toLowerCase()) && this.buffer.push(s[r]);
        return this;
    }

    match = (t, i) => {
        if ("string" == typeof t && "" !== t) {
            i = i || "ig";
            t = new RegExp(t, i);
            let s = this.buffer;
            this.buffer = [];
            for (let i in s) t.lastIndex = 0, t.exec(s[i][this.focused_field]) && this.buffer.push(s[i]);
        }
        return this;
    }

    equalTo = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) i[s][this.focused_field] == t && this.buffer.push(i[s]);
        return this;
    }

    in = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) this.in_array(i[s][this.focused_field], t) && this.buffer.push(i[s]);
        return this;
    }

    moreThan = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) > parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    moreThanOrEqualTo = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) >= parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    lessThan = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) < parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    lessThanOrEqualTo = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) <= parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    orderBy = (t, i) => {
        let s = "asc",
            r = t.split(" "),
            f = r.pop();
        if (f && "desc" == f.toLowerCase()) {
            s = "desc";
            t = r.join(" ");
        }

        let e = [];
        for (let h in this.buffer) e.push([h, this.buffer[h][t]]);
        if (e.length < 2) return this;
        i = void 0 == i && isNaN(e[0][1]) ? "string" : "numeric";
        "string" == i ? e.sort((t, i) => t[1] < i[1] ? -1 : t[1] > i[1] ? 1 : 0) : e.sort((t, i) => t[1] - i[1]);
        let results = [];
        for (let h in e) results.push(this.buffer[e[h][0]]);
        this.buffer = results;
        "desc" == s && (this.buffer = this.buffer.reverse());
        return this;
    }

    and = this.where;
    is = this.equalTo;

    in_array = (t, i) => {
        for (let s in i) if (t == i[s]) return true;
        return false;
    }
}