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
// Define a class for handling Thailand address data
class ThailandAddress {
    constructor(options) {
        // Initialize an empty array to store address data
        this.options = options;
        this.db = [];
    }

    // Method to load data into the class
    loadData = (data) => {
        // Assume data format is already in the provided structure
        this.db = data;
        return this;
    };

    // Method to build a query instance for address data
    buildQueryInstance = () => new Query(this.mapStrings());

    // Method to map strings from the loaded data
    mapStrings = () => {
        let resultArray = this.db.flatMap(province => 
            province.amphure.flatMap(amphure => 
                amphure.tambon.map(tambon => ({
                    'tambon_id': tambon.id,
                    'tambon': tambon[`name_${this.options.lang}`],
                    'tambon_th': tambon.name_th,
                    'tambon_en': tambon.name_en,
                    'amphure_id': amphure.id,
                    'amphure': amphure[`name_${this.options.lang}`],
                    'amphure_th': amphure.name_th,
                    'amphure_en': amphure.name_en,
                    'province_id': province.id,
                    'province': province[`name_${this.options.lang}`],
                    'province_th': province.name_th,
                    'province_en': province.name_en,
                    'zipcode': tambon.zip_code
                }))
            )
        );

        return resultArray;
    };

    // Method to execute the query instance and set it to the global object
    execute = () => {
        const queryInstance = this.buildQueryInstance();
        $.Address.DB = queryInstance;
        return queryInstance;
    };
}

// Create a global object for handling addresses
$.Address = options => {
    "use strict";

    // Extend the provided settings with default settings
    options = $.extend({}, $.Address.defaults, options);

    // Function to calculate string similarity
    const stringSimilarity = (str1, str2, isPercentage) => {
        // Implementation of string similarity calculation
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

    // Main function for handling address data
    !function (callback) {
        // Create an instance of the ThailandAddress class
        const addressDB = new ThailandAddress(options);

        // Load data asynchronously from the provided JSON file
        $.getJSON(options.database)
            .done((response) => {
                callback(addressDB.loadData(response).execute());
            })
            .fail((error) => {
                // Handle errors during data loading
                console.error(`Error loading data from "${options.database}":`, error);
                throw new Error(`File "${options.database}" does not exist.`);
            });
    }(DB => {
        // Set the address query instance to the global object
        $.Address.DB = DB;
        let n, key, defaultTemplates = {
            empty: " ",
            suggestion: entry => {
                // Format the suggestion entry for display
                let tambon = entry.tambon;
                let amphure = entry.amphure;
                let province = entry.province;
                let zipcode = entry.zipcode;
                return `<div>${tambon} » ${amphure} » ${province} » ${zipcode}</div>`;
            },
        };
        var templates = typeof options.templates === 'object' ? Object.assign(defaultTemplates, options.templates) : defaultTemplates
        // Iterate over provided settings for typeahead functionality
        for (let n in options) {
            if (n.includes("$") && "$search" !== n && options.hasOwnProperty(n) && options[n] && options[n].typeahead) {
                // Initialize typeahead for each specified field
                options[n].typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1,
                }, {
                    limit: options.autocomplete_size,
                    templates: templates,
                    source: function (query, callback) {
                        // Fetch results based on the query
                        let results = [];
                        let field = this.$el.data("field");
                        try {
                            results = DB.select("*").where(field).match(`^${query}`).orderBy(field).fetch();
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

        // Configure typeahead for search functionality
        options.$search && options.$search.typeahead({
            hint: true,
            highlight: true,
            minLength: 2,
        }, {
            limit: options.autocomplete_size,
            templates: templates,
            source: function (query, callback) {
                // Fetch results for search based on the query
                let results = [];
                try {
                    results = [
                        ...DB.select("*").where("zipcode").match(query).fetch(),
                        ...DB.select("*").where(`province_${options.lang}`).match(query).fetch(),
                        ...DB.select("*").where(`amphure_${options.lang}`).match(query).fetch(),
                        ...DB.select("*").where(`tambon_${options.lang}`).match(query).fetch(),
                    ]
                        .map(entry => JSON.stringify(entry))
                        .filter((entry, index, self) => self.indexOf(entry) === index)
                        .map(entry => {
                            // Calculate likelihood for each result
                            entry = JSON.parse(entry);
                            entry.likely = [
                                5 * stringSimilarity(query, entry[`tambon_${options.lang}`]),
                                3 * stringSimilarity(query, entry[`amphure_${options.lang}`].replace(/^เมือง/, "")),
                                stringSimilarity(query, entry[`province_${options.lang}`]),
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

        // Bind typeahead select and autocomplete events
        for (n in options) n.includes("$") && options.hasOwnProperty(n) && options[n] && options[n].bind("typeahead:select typeahead:autocomplete", function (t, a) {
            // Update other fields on selection
            for (n in options) key = n.replace("$", ""), n.includes("$") && options.hasOwnProperty(n) && options[n] && a[key] && options[n].typeahead("val", a[key]).trigger("change");
            // Callback on data fill
            "function" == typeof options.onDataFill && (delete a.likely, options.onDataFill(a));
        }).blur(function () {
            // Clear suggestions if no value entered
            this.value || $(this).parent().find(".tt-dataset").html("");
        });

        // Execute onLoad and onComplete callbacks if provided
        "function" == typeof options.onLoad && options.onLoad();
        "function" == typeof options.onComplete && options.onComplete();
    });
};

// Default settings for the Thailand address typeahead
$.Address.defaults = {
    database: "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json",
    autocomplete_size: 20,
    onLoad: function() {},
    onDataFill: function() {},
    $tambon_th: false,
    $tambon_en: false,
    $tambon_id: false,
    $amphure_th: false,
    $amphure_en: false,
    $amphure_id: false,
    $province_th: false,
    $province_en: false,
    $province_id: false,
    $zipcode: false,
    $search: false,
    lang: "th"
};

// Setup function to configure default settings
$.Address.setup = options => $.extend($.Address.defaults, options);

// Define a class for building and executing queries
class Query {
    constructor(t) {
        // Parse the data source into an object
        if (typeof t === 'string') {
            t = JSON.parse(t);
        }

        // Initialize the query object with data source and options
        this.data_source = t;
        this.buffer = t;
        this.focused_field = "";
        this.options = [];
        this.size = false;

        // Extract available options from the data source
        for (let i in t) {
            for (let s in t[i]) {
                this.options.push(s);
            }
            break;
        }
    }

    // Method to fetch and filter data based on query parameters
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

    // Method to set a new data source for the query
    new = (t) => {
        this.data_source = t;
        this.buffer = t;
    }

    // Method to limit the number of results in the query
    limit = (t) => {
        return this.size = t, this;
    }

    // Method to select specific fields in the query
    select = (t) => {
        this.options = t;
        "string" == typeof t && "*" !== t && (this.options = t.split(","));
        this.buffer = this.data_source;
        this.size = false;
        return this;
    }

    // Method to set the focused field for filtering
    where = (t) => {
        this.focused_field = t;
        return this;
    }

    // Method to filter data based on partial string match
    contains = (t, i) => {
        let s = this.buffer;
        this.buffer = [];
        for (let r in s) i ? ~s[r][this.focused_field].indexOf(t) && this.buffer.push(s[r]) : ~s[r][this.focused_field].toLowerCase().indexOf(t.toLowerCase()) && this.buffer.push(s[r]);
        return this;
    }

    // Method to filter data based on regular expression match
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

    // Method to filter data based on exact match
    equalTo = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) i[s][this.focused_field] == t && this.buffer.push(i[s]);
        return this;
    }

    // Method to filter data based on an array of values
    whereIn = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) this.in_array(i[s][this.focused_field], t) && this.buffer.push(i[s]);
        return this;
    }

    // Method to filter data based on numeric comparison (greater than)
    moreThan = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) > parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    // Method to filter data based on numeric comparison (greater than or equal to)
    moreThanOrEqualTo = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) >= parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    // Method to filter data based on numeric comparison (less than)
    lessThan = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) < parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    // Method to filter data based on numeric comparison (less than or equal to)
    lessThanOrEqualTo = (t) => {
        let i = this.buffer;
        this.buffer = [];
        for (let s in i) parseFloat(i[s][this.focused_field]) <= parseFloat(t) && this.buffer.push(i[s]);
        return this;
    }

    // Method to order the results based on a specified field and order
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

    // Alias methods for query building
    and = this.where;
    is = this.equalTo;

    // Helper function to check if a value is in an array
    in_array = (t, i) => {
        for (let s in i) if (t == i[s]) return true;
        return false;
    }
}