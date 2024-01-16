# Demo
[Demo](https://jsfiddle.net/totza2010/k4n1L3qu/show)

## ThailandAddressTypeahead
ตัวช่วยกรอกข้อมูลจังหวัด อำเภอ ตำบล รหัสไปรษณี ของประเทศไทย โดยได้รับแรงบันดาลใจมาจาก [https://github.com/earthchie/jquery.Thailand.js](https://github.com/earthchie/jquery.Thailand.js) โดยใช้ฐานข้อมูล จังหวัด อำเภอ ตำบล รหัสไปรษณี ของประเทศไทย จาก [https://github.com/kongvut/thai-province-data](https://github.com/kongvut/thai-province-data)

# วิธีใช้

1. ติดตั้ง Dependencies

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/corejs-typeahead@1.3.4/dist/typeahead.bundle.min.js"></script>
```

2. ติดตั้ง ThailandAddressTypeahead

```html
<link rel="stylesheet" href="https://raw.githubusercontent.com/totza2010/ThailandAddressTypeahead/master/dist/ThailandAddressTypeahead.min.css">
<script type="text/javascript" src="https://raw.githubusercontent.com/totza2010/ThailandAddressTypeahead/master/dist/ThailandAddressTypeahead.min.js"></script>
```

3. สร้าง input สำหรับกรอก ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์
3.1 สำหรับ input ข้อมูลภาษาไทย
```html
<input type="text" id="tambon_th">
<input type="text" id="amphure_th">
<input type="text" id="province_th">
<input type="text" id="zipcode">
```

3.2 สำหรับ input ข้อมูลภาษาอังกฤษ
```html
<input type="text" id="tambon_en">
<input type="text" id="amphure_en">
<input type="text" id="province_en">
<input type="text" id="zipcode">
```

4. เรียกใช้ ThailandAddressTypeahead
4.1 สำหรับตั้งค่า ข้อมูลภาษาไทย
```javascript

$.Address({
    $tambon_th: $('#tambon_th'), // input ของตำบล
    $amphure_th: $('#amphure_th'), // input ของอำเภอ
    $province_th: $('#province_th'), // input ของจังหวัด
    $zipcode: $('#zipcode'), // input ของรหัสไปรษณีย์
});

```

4.2 สำหรับตั้งค่า ข้อมูลภาษาอังกฤษ
```javascript

$.Address({
    $tambon_en: $('#tambon_en'), // input ของตำบล
    $amphure_en: $('#amphure_en'), // input ของอำเภอ
    $province_en: $('#province_en'), // input ของจังหวัด
    $zipcode: $('#zipcode'), // input ของรหัสไปรษณีย์
});

```

4.3 สำหรับตั้งค่าข้อมูลทั้งสองภาษา
```javascript

$.Address({
    $tambon_th: $('#tambon_th'), // input ของตำบล
    $amphure_th: $('#amphure_th'), // input ของอำเภอ
    $province_th: $('#province_th'), // input ของจังหวัด
    $tambon_en: $('#tambon_en'), // input ของตำบล
    $amphure_en: $('#amphure_en'), // input ของอำเภอ
    $province_en: $('#province_en'), // input ของจังหวัด
    $zipcode: $('#zipcode'), // input ของรหัสไปรษณีย์
});

```

4.3 กำหนดค่า Database จากภายนอก
```javascript

$.Address({
    database: './ThailandAddressTypeahead/database/db.json', // path หรือ url ไปยัง database
    $tambon_th: $('#tambon_th'), // input ของตำบล
    $amphure_th: $('#amphure_th'), // input ของอำเภอ
    $province_th: $('#province_th'), // input ของจังหวัด
    $tambon_en: $('#tambon_en'), // input ของตำบล
    $amphure_en: $('#amphure_en'), // input ของอำเภอ
    $province_en: $('#province_en'), // input ของจังหวัด
    $zipcode: $('#zipcode'), // input ของรหัสไปรษณีย์
});

```
*** Database ที่ใช้ต้องมี Format ตามนี้เท่านั้น
```
[
  {
    "id": 1,
    "name_th": "กรุงเทพมหานคร",
    "name_en": "Bangkok",
    "geography_id": 2,
    "created_at": "2019-08-09T03:33:09.000+07:00",
    "updated_at": "2022-05-16T06:31:03.000+07:00",
    "deleted_at": null,
    "amphure": [
      {
        "id": 1001,
        "name_th": "เขตพระนคร",
        "name_en": "Khet Phra Nakhon",
        "province_id": 1,
        "created_at": "2019-08-09T03:33:09.000+07:00",
        "updated_at": "2022-05-16T06:31:26.000+07:00",
        "deleted_at": null,
        "tambon": [
          {
            "id": 100101,
            "zip_code": 10200,
            "name_th": "พระบรมมหาราชวัง",
            "name_en": "Phra Borom Maha Ratchawang",
            "amphure_id": 1001,
            "created_at": "2019-08-09T03:33:09.000+07:00",
            "updated_at": "2022-05-16T06:31:31.000+07:00",
            "deleted_at": null
          }
        ]
      }
    ]
  }
]
```
*** ใช้งาน ``$.Address.setup()`` เพื่อกำหนดค่า default
```javascript
    $.Address.setup({
        database: './ThailandAddressTypeahead/database/db.json'
    });

    // ไม่ต้องกำหนด path ของ database ซ้ำ
    $.Address({
        $search: $('#demo1 [name="search"]'),
        onDataFill: function(data){
            console.log(data)
        }
    });

    // ไม่ต้องกำหนด path ของ database ซ้ำเช่นกัน
    $.Address({
        $search: $('#demo2 [name="search"]'),
        onDataFill: function(data){
            console.log(data)
        }
    });
```

## ช่อง input ค้นหารวม

![image](https://cloud.githubusercontent.com/assets/7013039/25127003/642fa330-245e-11e7-9f0b-ab1d3f6e3085.png)

```javascript
$.Address({ 
    $search: $('#search'), // input ของช่องค้นหา
    onDataFill: function(data){ // callback เมื่อเกิดการ auto complete ขึ้น
        console.log(data);
    }
});
```

## geodb

geodb คือข้อมูล Area Code ของแต่ละพื้นที่

```javascript
$.Address({
    database: './ThailandAddressTypeahead/database/db.json', 

    $search: $('#search'),

    $tambon_id: $('#tambon_id'),
    $amphure_id: $('#amphure_id'),
    $province_id: $('#province_id'),

    onDataFill: function(data){
        console.log(data);
        /*
        ผลลัพธ์ที่ได้
        {
            tambon_id: '',
            tambon_th: '',
            tambon_en: '',
            amphure_id: '',
            amphure_th: '',
            amphure_en: '',
            province_id: '',
            province_th: '',
            province_en: '',
            zipcode: ''
        }
        */
    }
});
```

## คำอธิบาย options ทั้งหมด

```javascript

$.Address({ 
    
    // path หรือ url ไปยัง database
    database: './ThailandAddressTypeahead/database/db.json',
    
    // ขนาดของตัวเลือกใน Dropdown 
    // (ไม่ระบุก็ได้ ค่า default คือ 20)
    autocomplete_size: 20, 
    
    // input area code ของตำบล
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $tambon_id: $('#tambon_id'), 
    
    // input ของตำบลภาษาไทย
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $tambon_th: $('#tambon_th'), 
    
    // input ของตำบลภาษาอังกฤษ
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $tambon_en: $('#tambon_en'), 
    
    // input area code ของอำเภอ
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $amphure_id: $('#amphure_id'), 
    
    // input ของอำเภอภาษาไทย
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $amphure_th: $('#amphure_th'), 
    
    // input ของอำเภอภาษาอังกฤษ
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $amphure_en: $('#amphure_en'), 
    
    // input area code ของจังหวัด
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $province_id: $('#province_id'), 
    
    // input ของจังหวัดภาษาไทย
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $province_th: $('#province_th'), 
    
    // input ของจังหวัดภาษาอังกฤษ
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $province_en: $('#province_en'), 
    
    // input ของรหัสไปรษณีย์
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $zipcode: $('#zipcode'), 
    
    // input ของช่องค้นหา 
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    $search: $('#search'), 
    
    // ภาษาของช่องค้นหา 
    // (ไม่ระบุก็ได้ ค่าเริ่มต้นคือ ภาษาไทย)
    lang: "th", 
    
    // callback เมื่อเกิดการ auto complete ขึ้น
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    onDataFill: function(data){ 
        console.log('Data Filled', data);
    },
    
    // callback เมื่อโหลดฐานข้อมูลเสร็จและระบบ Auto Complete พร้อมที่จะทำงาน
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    onLoad: function(){ 
        console.info('Autocomplete is ready!');
    },

    // object templates ใช้สำหรับ render dataset ใน typeahead.js
    // สามารถอ่านเพิ่มเติมได้ที่ field templates ใน https://github.com/corejavascript/typeahead.js/blob/master/doc/jquery_typeahead.md#datasets
    // (ไม่ระบุก็ได้หากไม่จำเป็นต้องใช้)
    templates: {
        empty: " ",
        suggestion: entry => {
            // Format the suggestion entry for display
            let tambon = entry.tambon;
            let amphure = entry.amphure;
            let province = entry.province;
            let zipcode = entry.zipcode;
            return `<div>${tambon} --> ${amphure} --> ${province} --> ${zipcode}</div>`;
        },
    }
});
```

## Original fork and idea
[earthchie](https://github.com/earthchie/) - Project Owner, Original fork 

## License
WTFPL 2.0 http://www.wtfpl.net/