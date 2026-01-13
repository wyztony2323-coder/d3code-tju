import React from 'react';
import { Modal, Card, Typography } from 'antd';
import { CampusInfo } from '@/types/extensions';

const { Meta } = Card;
const { Paragraph } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CampusInfo | null;
  embedded?: boolean; // 是否嵌入在侧边面板中
}

const CampusBuildingModal: React.FC<Props> = ({
  visible,
  onClose,
  data,
  embedded = false,
}) => {
  if (!visible || !data) return null;

  const content = (
    <Card
      hoverable
      cover={
        <img
          alt={data.name}
          src={data.imageUrl || 'https://via.placeholder.com/600x400'}
        />
      }
    >
      <Meta title={data.name} description={`${data.year}年`} />
      <Paragraph style={{ marginTop: 20 }}>{data.description}</Paragraph>
    </Card>
  );

  if (embedded) {
    return content;
  }

  return (
    <Modal
      title="校园历史风貌"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {content}
    </Modal>
  );
};

export default CampusBuildingModal;
