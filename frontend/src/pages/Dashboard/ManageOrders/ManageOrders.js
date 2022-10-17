import axios from "axios";
import { useEffect, useState } from "react";
import AdminBreadcrumb from "../AdminBreadcrumb";
import { baseUrl } from "../../../Utilities/Utils";
import Loading from "../../../shared/Loading/Loading";
import ErrorMessage from "../../../Utilities/Messages/ErrorMessage";
import Swal from "sweetalert2";
import { useAuth } from "../../../Contexts/AuthContext";

const ManageOrders = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [reload, setReload] = useState(false);

	const { isAdmin, currentUser } = useAuth();

	useEffect(() => {
		let url;
		if (isAdmin) {
			url = `${baseUrl}/orders`;
		} else {
			url = `${baseUrl}/orders?email=${currentUser.email}`;
		}
		setLoading(true);
		axios
			.get(url)
			.then((res) => {
				setOrders(res.data);
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				setError("Something went wrong. Please Try again later.");
			})
			.finally(setReload(false));
	}, [currentUser, isAdmin, reload]);

	const resetError = () => {
		setError("");
	};

	const updateStatus = (_id, status) => {
		if (isAdmin) {
			setError("");
			setLoading(true);
			axios
				.put(`${baseUrl}/orders/${_id}`, { status: !status })
				.then((res) => {
					if (res.data.modifiedCount > 0) {
						Swal.fire({
							title: "Order status updated",
							icon: "success",
							confirmButtonText: "OK",
						});
						setReload(true);
					}
					setLoading(false);
				})
				.catch((err) => {
					setError("Something went wrong! Please try again later.");
					console.log(err);
					setLoading(false);
				});
		} else {
			return false;
		}
	};

	// delete function
	const deleteHandler = (id) => {
		setError("");
		Swal.fire({
			title: "Are you sure?",
			text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#EF4444",
			cancelButtonColor: "#6B7280",
			confirmButtonText: "Yes, delete it!",
		}).then((result) => {
			if (result.isConfirmed) {
				setLoading(true);
				axios
					.delete(`${baseUrl}/orders/${id}`)
					.then((res) => {
						if (res.data.deletedCount > 0) {
							Swal.fire({
								title: "Order deleted successfully",
								icon: "success",
								confirmButtonText: "OK",
							});
							const remainingOrders = orders.filter(
								(user) => user._id !== id
							);
							setOrders(remainingOrders);
						}
						setLoading(false);
					})
					.catch((err) => {
						setError(
							"Something went wrong! Please try again later."
						);
						setLoading(false);
					});
			}
		});
	};

	return (
		<section>
			<AdminBreadcrumb
				pageTitle={isAdmin ? "Manage Orders" : "My Orders"}
				pagePath={isAdmin ? "Manage Orders" : "My Orders"}
			/>
			<div className="w-full shadow px-6 py-3">
				{error && <ErrorMessage text={error} resetError={resetError} />}
				<div className="mt-4">
					{loading ? (
						<Loading />
					) : (
						<section className="font-mono">
							<div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
								<div className="w-full overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="text-md font-semibold tracking-wide text-left text-gray-900 bg-gray-100 uppercase border-b border-gray-600">
												<th className="px-4 py-3">
													Product
												</th>
												<th className="px-4 py-3">
													Quantity
												</th>
												<th className="px-4 py-3">
													Status
												</th>
												<th className="px-4 py-3">
													Customer
												</th>
												<th className="px-4 py-3">
													Actions
												</th>
											</tr>
										</thead>
										<tbody className="bg-white">
											{orders.map((order) => (
												<tr className="text-gray-700">
													<td className="px-4 py-3 border">
														<div className="flex items-center font-semibold text-sm">
															{order.product}
														</div>
													</td>
													<td className="px-4 py-3 text-ms font-semibold border">
														{order.quantity}
													</td>
													<td className="px-4 py-3 text-xs border">
														<button
															onClick={() =>
																updateStatus(
																	order._id,
																	order.status
																)
															}
															className={`px-2 py-1 font-semibold leading-tight ${
																!order.status
																	? "text-orange-700 bg-orange-100"
																	: "text-green-700 bg-green-100"
															} rounded-sm`}
														>
															{order.status
																? "Shipped"
																: "Pending"}
														</button>
													</td>
													<td className="px-4 py-3 text-sm border">
														<div>
															<p className="font-semibold text-black">
																{order.fullName}
															</p>
															<p className="text-xs text-gray-600">
																{order.email}
															</p>
															<p className="text-xs text-gray-600">
																{order.phone}
															</p>
														</div>
													</td>
													<td className="px-4 py-3 text-sm font-semibold border">
														<button
															onClick={() =>
																deleteHandler(
																	order._id
																)
															}
															className="bg-red-100 text-red-700 px-2 py-1 font-semibold leading-tight rounded-sm text-sm"
														>
															Delete
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</section>
					)}
				</div>
			</div>
		</section>
	);
};

export default ManageOrders;
