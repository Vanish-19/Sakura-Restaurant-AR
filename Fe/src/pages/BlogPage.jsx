import { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { getPublishedArticles } from '../services/articleApi.js';

const { Title, Paragraph, Text } = Typography;

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await getPublishedArticles();
        if (res?.success) setArticles(res.data);
      } catch (err) {
        console.error('Lỗi tải bài viết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Title level={1} className="!text-4xl !mb-2">Tin tức & Sự kiện</Title>
        <Text className="text-gray-500 text-lg">Cập nhật những thông tin mới nhất từ Sakura Restaurant</Text>
      </div>

      {loading ? (
        <div className="text-center py-20"><Spin size="large" /></div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Chưa có bài viết nào được đăng.</div>
      ) : (
        <>
          {/* Featured Article */}
          {(() => {
            const featuredArticle = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
            const regularArticles = articles.filter(a => a._id !== featuredArticle._id);
            
            return (
              <>
                <div className="mb-12">
                  <Title level={3} className="!mb-6 border-b pb-2">Bài viết nổi bật</Title>
                  <Link to={`/blog/${featuredArticle._id}`}>
                    <Card
                      hoverable
                      className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                      bodyStyle={{ padding: 0 }}
                    >
                      <Row>
                        <Col xs={24} md={14}>
                          <div className="h-64 md:h-full min-h-[300px] overflow-hidden bg-gray-100">
                            {featuredArticle.image_url ? (
                              <img alt={featuredArticle.title} src={featuredArticle.image_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                          </div>
                        </Col>
                        <Col xs={24} md={10} className="flex flex-col justify-center p-8">
                          <Tag color={featuredArticle.category === 'Promotion' ? 'red' : 'blue'} className="w-max mb-4">
                            {featuredArticle.category}
                          </Tag>
                          <Title level={2} className="!mb-4 !text-3xl line-clamp-2" title={featuredArticle.title}>
                            {featuredArticle.title}
                          </Title>
                          <Paragraph className="text-gray-500 line-clamp-4 mb-6 text-lg">
                            {featuredArticle.content}
                          </Paragraph>
                          <div className="flex items-center gap-6 text-gray-400 mt-auto">
                            <span className="flex items-center gap-2">
                              <CalendarOutlined /> {new Date(featuredArticle.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <EyeOutlined /> {featuredArticle.views || 0} lượt xem
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Link>
                </div>

                <Title level={3} className="!mb-6 border-b pb-2">Tất cả bài viết</Title>
                <Row gutter={[24, 32]}>
                  {regularArticles.map(article => (
            <Col xs={24} md={12} lg={8} key={article._id}>
              <Link to={`/blog/${article._id}`}>
                <Card
                  hoverable
                  className="h-full overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
                  cover={
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {article.image_url ? (
                        <img alt={article.title} src={article.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                  }
                  bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <Tag color={article.category === 'Promotion' ? 'red' : 'blue'} className="w-max mb-3">
                    {article.category}
                  </Tag>
                  <Title level={4} className="!mb-2 line-clamp-2" title={article.title}>
                    {article.title}
                  </Title>
                  <Paragraph className="text-gray-500 line-clamp-3 flex-1 mb-4">
                    {article.content}
                  </Paragraph>
                  <div className="flex items-center justify-between text-gray-400 text-sm mt-auto pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <CalendarOutlined /> {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeOutlined /> {article.views} views
                    </span>
                  </div>
                </Card>
              </Link>
            </Col>
                  ))}
                </Row>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
