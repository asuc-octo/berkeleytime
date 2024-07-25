import { useEffect, useMemo } from "react";

import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

import Boundary from "@/components/Boundary";
import LoadingIndicator from "@/components/LoadingIndicator";
import { AccountResponse, GET_ACCOUNT } from "@/lib/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data, loading } = useQuery<AccountResponse>(GET_ACCOUNT);

  const account = useMemo(() => data?.user, [data]);

  useEffect(() => {
    if (loading || account?.staff) return;

    navigate("/account");
  }, [loading, account, navigate]);

  return account?.staff ? (
    <></>
  ) : (
    <Boundary>
      <LoadingIndicator />
    </Boundary>
  );
}
