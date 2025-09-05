import { Handle, Position, useConnection } from "@xyflow/react";

export function FlowNodeStep({ data }: { data: any }) {
  const connection = useConnection();

  return (
    <div
      style={{
        padding: 6,
        border: "1px solid #333",
        borderRadius: 6,
        background: "#fff",
        color: "#333",
        width: 260,
        height: 60,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {data.label}

      {!connection.inProgress ? (
        <Handle
          type="target"
          position={Position.Top}
          isConnectableStart={false}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 0,
            border: "1px solid #cc6666",
            backgroundColor: "rgb(255, 102, 102, 0.1)",
            transform: "translate(-50%, 0)",
          }}
        />
      )}
      {!connection.inProgress && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: "#666",
            width: 60,
            height: 15,
            borderRadius: "0 0 70% 70%",
            transform: "translate(-50%, 90%)",
          }}
        />
      )}
    </div>
  );
}

export function FlowNodeStart() {
  const connection = useConnection();

  return (
    <div
      style={{
        padding: 6,
        borderWidth: 0,
        borderRadius: 50,
        background: "#dcdcdc",
        color: "#333",
        width: 260,
        height: 60,
        fontSize: "1.4em",
        fontWeight: "bold",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      開始
      {!connection.inProgress && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: "#333",
            width: 60,
            height: 15,
            borderRadius: "0 0 70% 70%",
            transform: "translate(-50%, 99%)",
          }}
        />
      )}
    </div>
  );
}
