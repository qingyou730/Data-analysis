import ContentNewsList from '@/components/views/content/news/list'
import ContentNewsAdd from '@/components/views/content/news/add'
import ContentCategoryList from '@/components/views/content/category/list'
import ContentCategoryAdd from '@/components/views/content/category/add'


var content = [{
		path: '/content/news/list',
		name: '新闻列表',
		component: ContentNewsList
	},
	{
		path: '/content/news/add',
		name: '新闻新增',
		component: ContentNewsAdd
	},
	{
		path: '/content/category/list',
		name: '分类列表',
		component: ContentCategoryList
	},
	{
		path: '/content/category/add',
		name: '分类新增',
		component: ContentCategoryAdd
	}
]

export default content
