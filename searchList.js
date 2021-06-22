export const searchList = [
  {
    // label: 筛选框标签名
    label: '截至月份',
    // type：筛选框类型
    type: 'datePicker',
    // pickerOptions：datePicker需要做选择日期的限制
    pickerOptions: true,
    // name：接口参数的对应的属性名
    name: 'enddate',
    // defaultValue：默认筛选框的内容
    defaultValue: (new Date).getFullYear() + '-' + ((new Date).getMonth()> 9 ? ((new Date).getMonth() + 1) : "0" + ((new Date).getMonth() + 1)),
    // DatePicker中的type
    dataType: 'month',
    // 转换时间的类型
    format: 'yyyy-MM'
  },
  {
    label: '学生姓名',
    type: 'select',
    name: 'studentcode',
    // filterable: 是否可以搜索
    filterable: true,
    defaultValue: 0,
    // options: 筛选框为select的options列表
    options: [
        {
            name: '全部',
            code: 0
        }
    ]
  },
  {
    label: '开始时间',
    type: 'datePicker',
    pickerOptions: false,
    name: 'startdate',
    defaultValue: '',
    dataType: 'date',
    format: 'yyyy-MM-dd'
  },
  {
    label: '结束时间',
    type: 'datePicker',
    pickerOptions: false,
    name: 'enddate',
    defaultValue: '',
    dataType: 'date',
    format: 'yyyy-MM-dd'
  },
  {
    label: '常规课时',
    type: 'input',
    name: 'regularclasscount',
    // placeholder
    placeholder: '请输入购课常规课时数'
  },
]