import React from 'react';
import { Modal, Card, Typography } from 'antd';
import { CampusInfo } from '@/types/extensions';

const { Meta } = Card;
const { Paragraph } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  data: CampusInfo | null;
}

const CampusBuildingModal: React.FC<Props> = ({ visible, onClose, data }) => {
  return (
    <Modal
      title="校园历史风貌"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {data && (
        <Card
          hoverable
          cover={<img alt={data.name} src={data.imageUrl || "https://via.placeholder.com/600x400"} />}
        >
          <Meta title={data.name} description={`${data.year}年`} />
          <Paragraph style={{ marginTop: 20 }}>
            {data.description}
          </Paragraph>
        </Card>
      )}
    </Modal>
  );
};

export default CampusBuildingModal;
