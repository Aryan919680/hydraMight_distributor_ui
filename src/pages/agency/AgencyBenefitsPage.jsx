import { useEffect, useState } from "react";
import {
  Gift,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";

import { DistributorShell } from "../../components/AppShell";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";

import { getAgencyBenefits } from "../../api/agencyFlowApi";
import { storage } from "../../utils/storage";

const typeIcon = {
  gift: Gift,
  benefit: Sparkles,
  offer: Tag,
  incentive: Sparkles,
};

const label = (value) =>
  String(value || "").replace(/_/g, " ");

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : null;

export default function AgencyBenefitsPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const response = await getAgencyBenefits(token);
      setBenefits(response.data || []);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading gifts and benefits..." />
      </DistributorShell>
    );
  }

  return (
    <DistributorShell user={user}>
      <Toast
        {...(toast || {})}
        onClose={() => setToast(null)}
      />

      <div className="page-header">
        <div>
          <p className="eyebrow">Agency Portal</p>
          <h2>Gifts & Benefits</h2>

          <p className="muted">
            Exclusive offers, incentives and rewards for your agency.
          </p>
        </div>

        <button className="secondary-btn" onClick={load}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit) => {
          const Icon =
            typeIcon[benefit.benefit_type] || Sparkles;

          return (
            <article className="benefit-card" key={benefit.id}>
              <div className="benefit-icon">
                <Icon size={23} />
              </div>

              <div className="benefit-card-head">
                <span className="badge">
                  {label(benefit.benefit_type)}
                </span>

                {benefit.benefit_value && (
                  <strong>{benefit.benefit_value}</strong>
                )}
              </div>

              <h3>{benefit.title}</h3>

              <p>
                {benefit.short_description ||
                  benefit.description ||
                  "Benefit details are available from your account manager."}
              </p>

              {benefit.terms_and_conditions && (
                <details>
                  <summary>Terms & conditions</summary>
                  <p>{benefit.terms_and_conditions}</p>
                </details>
              )}

              {benefit.ends_at && (
                <small>
                  Valid until {date(benefit.ends_at)}
                </small>
              )}
            </article>
          );
        })}

        {!benefits.length && (
          <div className="empty-state">
            No gifts or benefits are available right now.
          </div>
        )}
      </div>
    </DistributorShell>
  );
}