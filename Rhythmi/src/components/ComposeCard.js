import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ComposeCard.module.css";

const ComposeCard = () => {
  const navigate = useNavigate();

  const onFrameLinkClick = useCallback(() => {
    navigate("/createpage");
  }, [navigate]);

  return (
    <div className={styles.frame}>
      <img className={styles.frameIcon} alt="" src="/frame1.svg" />
      <div className={styles.frame1}>
        <div className={styles.frame2}>
          <a
            className={styles.composeYourFirstPieceHereWrapper}
            onClick={onFrameLinkClick}
          >
            <b className={styles.composeYourFirst}>
              Compose your first piece here
            </b>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComposeCard;
