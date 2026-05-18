import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Spin, Tag, Button, Breadcrumb } from 'antd';
import { CalendarOutlined, EyeOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { getArticleById } from '../services/articleApi.js';

const { Title, Paragraph } = Typography;

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await getArticleById(id);
        if (res?.success) {
          setArticle(res.data);
        } else {
          setError('Không tìm thấy bài viết');
        }
      } catch (err) {
        console.error(err);
        setError('Bài viết không tồn tại hoặc đã bị xóa.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="text-center py-32"><Spin size="large" /></div>;
  if (error || !article) return (
    <div className="text-center py-32">
      <Title level={3} className="text-gray-500 mb-6">{error}</Title>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')}>Quay lại danh sách</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumb className="mb-6" items={[
        { title: <Link to="/">Trang chủ</Link> },
        { title: <Link to="/blog">Blog</Link> },
        { title: article.category }
      ]} />

      {article.image_url && (
        <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8 shadow-sm">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="mb-8">
        <Tag color={article.category === 'Promotion' ? 'red' : 'blue'} className="mb-4 text-sm px-3 py-1">
          {article.category}
        </Tag>
        <Title level={1} className="!text-3xl md:!text-4xl !leading-tight !mb-4">{article.title}</Title>
        
        <div className="flex flex-wrap items-center gap-6 text-gray-500 border-b border-gray-100 pb-6">
          <span className="flex items-center gap-2">
            <UserOutlined /> Tác giả: <strong className="text-gray-700">{article.author}</strong>
          </span>
          <span className="flex items-center gap-2">
            <CalendarOutlined /> {new Date(article.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="flex items-center gap-2">
            <EyeOutlined /> {article.views} lượt xem
          </span>
        </div>
      </div>

      <div className="article-content text-lg leading-relaxed text-gray-700 pb-12">
        {article.content.split('\n').map((paragraph, index) => (
          <Paragraph key={index} className="!text-lg !leading-loose !mb-6">
            {paragraph}
          </Paragraph>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-8 mt-8 text-center">
        <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')}>
          Xem thêm các bài viết khác
        </Button>
      </div>
    </div>
  );
}
