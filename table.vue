<template>
  <el-table
      class="table-list"
      :data="data"
      border
      stripe
      highlight-current-row
      @sort-change="sortMethod"
    >
      <el-table-column
        type="index" 
        label="序号">
      </el-table-column>
    </el-table>
</template>

<script>
export default {
    props: {
        data: {
            type: Array,
            default() {
                return []
            }
        }
    },
    methods: {

    }
}
</script>

<style>

</style>