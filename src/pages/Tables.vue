<template>
    <span class="buscador">
        <input type="text" placeholder="Search..." v-model="name" class="m-3 p-2 w-150 border-2 border-black-500" />
        <SearchOutlined />
    </span>

    <a-table :columns="columns" :data-source="filteredPeople">
        <template #headerCell="{ column }">
            <template v-if="column.key === 'name'">
                <span>
                    Name
                </span>
            </template>
        </template>

        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
                <a>
                    {{ record.name }}
                </a>
            </template>
            <template v-else-if="column.key === 'status'">
                <span>
                    <a-tag :color="record.status === 'completed' ? 'green' : 'red'">
                        {{ record.status.toUpperCase() }}
                    </a-tag>
                </span>
            </template>
            <template v-else-if="column.key === 'images'">

                <img class="w-16 h-16" :src="record.img" :alt="record.name" />

            </template>
        </template>
    </a-table>
</template>
<script lang="ts">
import { reactive, toRefs, computed, defineComponent } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';

const columns = [
    {
        name: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
    },
    {
        title: 'Images',
        key: 'images',
        dataIndex: 'images',
    }
];

const data = [
    {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        status: 'completed',
        img: 'https://empresas.blogthinkbig.com/wp-content/uploads/2019/11/Imagen3-245003649.jpg?w=800'
    },
    {
        key: '2',
        name: 'Joe Jimenez',
        age: 58,
        address: 'Sidney No. 1 Lake Park',
        status: 'pendient',
        img: 'https://empresas.blogthinkbig.com/wp-content/uploads/2019/11/Imagen3-245003649.jpg?w=800'
    },
    {
        key: '3',
        name: 'Jim Green',
        age: 42,
        address: 'Ciudad Guayana, Puerto Ordaz',
        status: 'completed',
        img: 'https://empresas.blogthinkbig.com/wp-content/uploads/2019/11/Imagen3-245003649.jpg?w=800'
    },
    {
        key: '4',
        name: 'Joe Black',
        age: 32,
        address: 'Upata, Avenida Camejo',
        status: 'pendient',
        img: 'https://empresas.blogthinkbig.com/wp-content/uploads/2019/11/Imagen3-245003649.jpg?w=800'
    },


];

export default defineComponent({
    components: {
        SearchOutlined
    },
    setup() {
        const state = reactive({
            name: '',
            filteredPeople: computed(() => searchPeople())
        })
        const { name, filteredPeople } = toRefs(state);
        function searchPeople() {
            return data.filter((list) => list.name.toLowerCase().includes(state.name.toLowerCase()) ||
                list.status.toLowerCase().includes(state.name.toLowerCase()) ||
                list.address.toLowerCase().includes(state.name.toLowerCase())
            )
        }
        return {
            filteredPeople,
            name,
            data,
            columns,
        };
    },
});
</script>

