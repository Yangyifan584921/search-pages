<template>
  <div class="main-wrapper">
      <div class="header">
        <SearchHeader>
            <Search 
            ref="search" 
            :searchList="searchList"
            :searchListCopy="searchListCopy"
            @choose-options="getChooseOptions" 
            @filter-methods="filterMethods"
            @focus-select="focusSelect"/>
        </SearchHeader>
        <div class="btn-group">
            <div class="btn-left">
                <el-button type="primary">添加新学员</el-button>
            </div>
            <div class="btn-right">
            <el-button type="primary" @click="onSubmit">查询</el-button>
            <el-button @click="exportExcel">导出</el-button>
            </div>
        </div> 
      </div>
      <Table :data="dataList" />
      <Pagination
        :pageIndex="pages.pageindex" 
        :pageSize="pages.pagesize" 
        :total="pageTotal"
        @size-change="sizeChange"
        @page-change="pageChange"/>
  </div>
</template>

<script>
import SearchHeader from '@/components/SearchFormHeader'
import Search from '@/components/SearchForm'
import Table from './table'
import Pagination from '@/components/Pagination/Pagination.vue'
import { searchList } from './searchList'
import { getStussBysch } from '@/api/classMange'
import { formatParams } from '@/utils/utils'
import { getList } from '@/api/students'
export default {
    data() {
        return {
            searchList,
            searchListCopy: JSON.parse(JSON.stringify(searchList)),
            pages: {
                pageindex: 1,
                pagesize: 10
            },
            pageTotal: 1,
            dataList: [],
            paramsOther: {
                sortindex: 0,
                isdesc: true
            },
            studentDefaultOptions: []
        }
    },
    components: {
        SearchHeader,
        Search,
        Table,
        Pagination
    },
    mounted() {
        const camp = this.$store.state.UserToken.schoolItems
        if(camp.length === 1) {
            this.getStudentName(camp[0].code)
        }
        this.getList()
    },
    methods: {
        // 查询列表
        async getList () {
            // 获取search组件的表单内容
            const result = this.$refs.search.getSearchData()
            const paramsMerge = {
                ...result,
                ...this.pages,
                ...this.paramsOther
            }
            const params = formatParams(paramsMerge)
            const { data, total } = await getList(params)
            this.pageTotal = total
            this.dataList = data
        },
        onSubmit() {
            this.$set(this.pages, 'pageindex', 1)
            this.getList()
        },
        ExcleTable() {
            return new Promise(async rs => {
                const result = this.$refs.search.getSearchData()
                const paramsMerge = {
                    ...this.paramsOther,
                    ...result,
                    ...{
                        pageindex: 1,
                        pagesize: 0
                    }
                }
                const params = formatParams(paramsMerge)
                const { data } = await getList(params)
                data.forEach((item, index) => {
                    item.index = index + 1
                    item.sexname = item.sex ? '男' : '女'
                })
                rs(data)
            })
        },
        // 导出
        async exportExcel() {
            let loading = this.$loading({
                lock: true,
                text: '正在导出数据...',
                target: document.querySelector(".main-wrapper"),
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.7)'
            });
            const data = await this.ExcleTable()
            if(data.length) {
                const Excel = require('rz-vue-excel')
                new Excel({
                    header: [
                        '序号',
                        '大区',
                        '校区',
                        '学员姓名',
                        '学员编号',
                        '性别',
                        '出生日期',
                        '入学日期',
                        '在校状态',
                        '评估状态',
                        '上课状态'
                    ],

                    filterVal: [
                        'index',
                        'provincetypename',
                        'schoolitemname',
                        'name',
                        'no',
                        'sexname',
                        'birthday',
                        'startschooldate',
                        'schoolstatusname',
                        'assessstatusname',
                        'attendstatusname'
                    ], // 对应字段
                    list: data,
                    autoWidth: true,
                    fileName: '学员列表',
                }).export_excel()
                loading.close()
            } else {
                loading.close()
                this.$message.error('暂无数据');
            }
            
        },
        // 给options赋值之前的要做的操作
        clearOptions(name) {
            return new Promise((rs, rj) => {
                // 先清空原有的列表
                const index = this.searchListCopy.findIndex(item => item.name === name)
                this.searchListCopy[index].options = this.searchList[index].options
                // 清空select的内容
                this.$set(this.$refs.search.searchForm, name, 0)
                rs(true)
            })
        },
        // 请求数据后给searchList中对应的options赋值
        changeOptions(itemName, data) {
            const index = this.searchListCopy.findIndex(item => item.name === itemName)
            const mergeOptions = [...this.searchList[index].options, ...data]
            this.$set(this.searchListCopy[index], 'options', mergeOptions)
            if(itemName === 'studentcode') {
                // 如果需要做模糊查询，需要先保存模糊查询之前的options列表
                this.studentDefaultOptions = mergeOptions
            }
        },
        // 获取学生姓名
        async getStudentName(schoolCode) {
            const data = await getStussBysch(schoolCode)
            this.changeOptions('studentcode', data)
        },
        // 处理联动
        async getChooseOptions(val, name) {
            const { schoolitemcode } = this.$refs.search.searchForm
            // 校区与学生姓名联动
            if(name === 'schoolitemcode' || name === 'provincetypecode') {
                await this.clearOptions('studentcode')
                this.getStudentName(schoolitemcode)
            }
        },
        // 模糊查询
        filterMethods(val, name) {
            if(name === 'studentcode') {
                const index = this.searchListCopy.findIndex(item => item.name === name)
                if(val) {
                    const filterList = this.studentDefaultOptions.filter(item => item.name.includes(val))
                    this.$set(this.searchListCopy[index], 'options', filterList)
                    return
                }
                this.$set(this.searchListCopy[index], 'options', this.studentDefaultOptions)
            }
        },
        focusSelect(name) {
            // 聚焦的操作
            console.log(name)
        },
        // 分页的方法
        sizeChange(val) {
            this.$set(this.pages, 'pagesize', val)
            this.getList()
        },
        // 分页的方法
        pageChange(val) {
            this.$set(this.pages, 'pageindex', val)
            this.getList()
        },
    },
    watch: {
        '$store.getters.getIsReloadList': {
            handler(val) {
                if(val) {
                    this.getList()
                }
                this.$store.commit('setRoloadList', false)

            }
        }
    }
}
</script>

<style scoped lang="less">
.main-wrapper {
  padding: 10px;
}
.btn-group {
  margin-bottom: 20px;
  padding: 10px 15px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>